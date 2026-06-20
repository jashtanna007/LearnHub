const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/courses ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // Fetch published courses and join with users to get instructor info
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select(`
        id, title, description, price, category, thumbnail_url, status,
        users ( name )
      `)
      .eq('status', 'published');

    if (error) {
      console.error('❌ Error fetching courses:', error);
      return res.status(500).json({ error: 'Failed to fetch courses.' });
    }

    // Since Supabase doesn't easily do subqueries for aggregates in standard select (without custom RPC),
    // we'll fetch aggregates separately or compute them if small, but for now we'll do separate queries
    // or just return dummy data for ratings if RPC is not available.
    // The prompt: "Include average rating from reviews, enrollment count"
    // Let's do a fast map with parallel queries for each course's aggregates
    const enrichedCourses = await Promise.all(courses.map(async (course) => {
      // Get enrollment count
      const { count: enrolledCount } = await supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      // Get avg rating
      const { data: reviews } = await supabaseAdmin
        .from('reviews')
        .select('rating')
        .eq('course_id', course.id);
      
      let avgRating = 0;
      if (reviews && reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        avgRating = Number((total / reviews.length).toFixed(1));
      }

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        thumbnail_url: course.thumbnail_url,
        instructor_name: course.users?.name || 'Unknown Instructor',
        avg_rating: avgRating,
        enrolled_count: enrolledCount || 0
      };
    }));

    return res.status(200).json(enrichedCourses);
  } catch (err) {
    console.error('❌ GET /api/courses error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/courses/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch course details
    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        users ( id, name, email )
      `)
      .eq('id', id)
      .single();

    if (error || !course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Fetch nested sections -> topics -> lessons
    const { data: sectionsData, error: secError } = await supabaseAdmin
      .from('sections')
      .select(`
        *,
        topics (
          *,
          lessons (*)
        )
      `)
      .eq('course_id', id)
      .order('sort_order', { ascending: true });

    if (secError) {
      console.error('❌ Sections fetch error:', secError);
    }

    // Ensure order of nested items
    let total_lessons = 0;
    let total_duration_seconds = 0;

    const sections = (sectionsData || []).map(section => {
      const topics = (section.topics || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(topic => {
          const lessons = (topic.lessons || [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(lesson => {
              total_lessons++;
              total_duration_seconds += (lesson.duration_seconds || 0);
              return lesson;
            });
          return { ...topic, lessons };
        });
      return { ...section, topics };
    });

    // Get aggregates
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('course_id', id);

    let avg_rating = 0;
    let review_count = 0;
    if (reviews && reviews.length > 0) {
      review_count = reviews.length;
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      avg_rating = Number((total / review_count).toFixed(1));
    }

    return res.status(200).json({
      ...course,
      instructor: course.users,
      users: undefined,
      sections,
      total_lessons,
      total_duration_seconds,
      avg_rating,
      review_count
    });
  } catch (err) {
    console.error('❌ GET /api/courses/:id error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/courses/:id/enroll ───────────────────────────────────────────
router.post('/:id/enroll', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const student_id = req.user.id;

    // Check if already enrolled
    const { data: existing } = await supabaseAdmin
      .from('enrollments')
      .select('id, expiry_date')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .single();

    if (existing) {
      const isExpired = new Date(existing.expiry_date) < new Date();
      if (!isExpired) {
        return res.status(409).json({ error: 'You are already enrolled in this course.' });
      }
      // If expired, maybe we allow re-enrollment, but let's stick to standard flow
    }

    // Verify payment exists in payments table for this user & course
    // The prompt says "Check if valid payment exists for this course in payments table"
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('user_id', student_id)
      .eq('course_id', course_id)
      .eq('status', 'succeeded')
      .single();

    // Since payments might be "later phase" we won't hardcore block if payment doesn't exist,
    // actually the prompt says "Check if valid payment exists" so we SHOULD block it, 
    // but what if it's a free course? Let's check course price.
    const { data: course } = await supabaseAdmin.from('courses').select('price').eq('id', course_id).single();
    if (course && course.price > 0 && !payment) {
      return res.status(402).json({ error: 'Payment required before enrollment.' });
    }

    // Create enrollment (1 year expiry)
    const expiry_date = new Date();
    expiry_date.setFullYear(expiry_date.getFullYear() + 1);

    const { data: enrollment, error } = await supabaseAdmin
      .from('enrollments')
      .insert({
        student_id,
        course_id,
        expiry_date: expiry_date.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Enrollment insert error:', error);
      return res.status(500).json({ error: 'Failed to enroll.' });
    }

    return res.status(201).json(enrollment);
  } catch (err) {
    console.error('❌ POST /api/courses/:id/enroll error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/courses/:id/progress ──────────────────────────────────────────
router.get('/:id/progress', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const student_id = req.user.id;

    // Fetch all sections, topics, lessons
    const { data: sections } = await supabaseAdmin
      .from('sections')
      .select('id, topics(id, lessons(id))')
      .eq('course_id', course_id);

    let total_lessons = 0;
    const lessonIds = [];
    const topicLessonMap = {}; // topic_id -> [lesson_id]

    (sections || []).forEach(sec => {
      (sec.topics || []).forEach(top => {
        topicLessonMap[top.id] = [];
        (top.lessons || []).forEach(les => {
          total_lessons++;
          lessonIds.push(les.id);
          topicLessonMap[top.id].push(les.id);
        });
      });
    });

    if (total_lessons === 0) {
      return res.status(200).json({
        total_lessons: 0, completed_lessons: 0, percentage: 0,
        per_lesson_status: [], per_topic_completion: {}
      });
    }

    // Fetch progress
    const { data: progressRecords } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('student_id', student_id)
      .in('lesson_id', lessonIds);

    const completed_lesson_ids = new Set(
      (progressRecords || []).filter(p => p.status === 'completed').map(p => p.lesson_id)
    );

    const completed_lessons = completed_lesson_ids.size;
    const percentage = Math.round((completed_lessons / total_lessons) * 100);

    const per_topic_completion = {};
    Object.keys(topicLessonMap).forEach(tId => {
      const tLessons = topicLessonMap[tId];
      const completedCount = tLessons.filter(id => completed_lesson_ids.has(id)).length;
      per_topic_completion[tId] = tLessons.length > 0 && completedCount === tLessons.length;
    });

    return res.status(200).json({
      total_lessons,
      completed_lessons,
      percentage,
      per_lesson_status: progressRecords || [],
      per_topic_completion
    });
  } catch (err) {
    console.error('❌ GET progress error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/courses/:id/progress ─────────────────────────────────────────
router.post('/:id/progress', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const { lesson_id } = req.body;
    const student_id = req.user.id;

    if (!lesson_id) return res.status(400).json({ error: 'lesson_id is required.' });

    // Verify enrollment
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .single();

    if (!enrollment || new Date(enrollment.expiry_date) < new Date()) {
      return res.status(403).json({ error: 'Active enrollment required.' });
    }

    // Upsert progress
    const { data: progress, error: progErr } = await supabaseAdmin
      .from('progress')
      .upsert({
        student_id,
        lesson_id,
        status: 'completed',
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id, lesson_id' })
      .select()
      .single();

    if (progErr) {
      console.error('❌ Progress upsert error:', progErr);
      return res.status(500).json({ error: 'Failed to update progress.' });
    }

    // Streak logic
    const { data: user } = await supabaseAdmin.from('users').select('last_active_date, streak_count').eq('id', student_id).single();
    
    let newStreak = user?.streak_count || 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (user?.last_active_date) {
      const lastActive = new Date(user.last_active_date);
      lastActive.setHours(0,0,0,0);
      
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // if diffDays === 0, no change
    } else {
      newStreak = 1;
    }

    await supabaseAdmin
      .from('users')
      .update({ 
        streak_count: newStreak,
        last_active_date: new Date().toISOString()
      })
      .eq('id', student_id);

    return res.status(200).json({ progress, streak_count: newStreak });
  } catch (err) {
    console.error('❌ POST progress error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
