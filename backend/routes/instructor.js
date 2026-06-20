const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/instructor/courses ────────────────────────────────────────────
router.get('/courses', verifyToken, authorizeRoles('instructor'), async (req, res) => {
  try {
    const instructor_id = req.user.id;

    // Fetch courses by this instructor
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('id, title, status, thumbnail_url, price, category')
      .eq('instructor_id', instructor_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ GET instructor courses error:', error);
      return res.status(500).json({ error: 'Failed to fetch courses.' });
    }

    // Enrich with metrics (enrollments and avg rating)
    const enriched = await Promise.all((courses || []).map(async (course) => {
      // Enrollment count
      const { count: enrolledCount } = await supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      // Average rating
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
        ...course,
        enrolled_count: enrolledCount || 0,
        avg_rating: avgRating
      };
    }));

    return res.status(200).json(enriched);
  } catch (err) {
    console.error('❌ GET instructor courses error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/instructor/courses ───────────────────────────────────────────
router.post('/courses', verifyToken, authorizeRoles('instructor'), async (req, res) => {
  try {
    const { title, description, price, category, thumbnail_url } = req.body;
    const instructor_id = req.user.id;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required.' });
    }

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .insert({
        title,
        description,
        price: price || 0,
        category,
        thumbnail_url,
        instructor_id,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ POST create course error:', error);
      return res.status(500).json({ error: 'Failed to create course.' });
    }

    return res.status(201).json(course);
  } catch (err) {
    console.error('❌ POST create course error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── PATCH /api/instructor/courses/:id/publish ──────────────────────────────
router.patch('/courses/:id/publish', verifyToken, authorizeRoles('instructor'), async (req, res) => {
  try {
    const { id } = req.params;
    const instructor_id = req.user.id;

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('id', id)
      .eq('instructor_id', instructor_id)
      .single();

    if (!existing) {
      return res.status(403).json({ error: 'Not authorized to modify this course.' });
    }

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .update({ status: 'published' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json(course);
  } catch (err) {
    console.error('❌ PATCH publish course error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/instructor/courses/:id/sections ──────────────────────────────
router.post('/courses/:id/sections', verifyToken, authorizeRoles('instructor'), async (req, res) => {
  try {
    const course_id = req.params.id;
    const { title, sort_order } = req.body;
    const instructor_id = req.user.id;

    if (!title) return res.status(400).json({ error: 'Title is required.' });

    // Verify course ownership
    const { data: course } = await supabaseAdmin.from('courses').select('id').eq('id', course_id).eq('instructor_id', instructor_id).single();
    if (!course) return res.status(403).json({ error: 'Not authorized.' });

    const { data: section, error } = await supabaseAdmin
      .from('sections')
      .insert({ course_id, title, sort_order: sort_order || 0 })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(section);
  } catch (err) {
    console.error('❌ POST course sections error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/instructor/sections/:id/topics ───────────────────────────────
router.post('/sections/:id/topics', verifyToken, authorizeRoles('instructor'), async (req, res) => {
  try {
    const section_id = req.params.id;
    const { title, sort_order } = req.body;
    const instructor_id = req.user.id;

    if (!title) return res.status(400).json({ error: 'Title is required.' });

    // Verify course ownership via section
    const { data: section } = await supabaseAdmin.from('sections').select('course_id').eq('id', section_id).single();
    if (!section) return res.status(404).json({ error: 'Section not found.' });
    const { data: course } = await supabaseAdmin.from('courses').select('id').eq('id', section.course_id).eq('instructor_id', instructor_id).single();
    if (!course) return res.status(403).json({ error: 'Not authorized.' });

    const { data: topic, error } = await supabaseAdmin
      .from('topics')
      .insert({ section_id, title, sort_order: sort_order || 0 })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(topic);
  } catch (err) {
    console.error('❌ POST section topics error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/instructor/topics/:id/lessons ────────────────────────────────
router.post('/topics/:id/lessons', verifyToken, authorizeRoles('instructor'), async (req, res) => {
  try {
    const topic_id = req.params.id;
    const { title, video_url, duration_seconds, sort_order } = req.body;
    const instructor_id = req.user.id;

    if (!title) return res.status(400).json({ error: 'Title is required.' });

    // Verify ownership via topic -> section -> course
    const { data: topic } = await supabaseAdmin.from('topics').select('section_id').eq('id', topic_id).single();
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
    const { data: section } = await supabaseAdmin.from('sections').select('course_id').eq('id', topic.section_id).single();
    const { data: course } = await supabaseAdmin.from('courses').select('id').eq('id', section.course_id).eq('instructor_id', instructor_id).single();
    if (!course) return res.status(403).json({ error: 'Not authorized.' });

    const { data: lesson, error } = await supabaseAdmin
      .from('lessons')
      .insert({
        topic_id,
        title,
        video_url,
        duration_seconds: duration_seconds || 0,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(lesson);
  } catch (err) {
    console.error('❌ POST topic lessons error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── DELETE /api/instructor/courses/:id ──────────────────────────────────────
router.delete('/courses/:id', verifyToken, authorizeRoles('instructor'), async (req, res) => {
  try {
    const { id } = req.params;
    const instructor_id = req.user.id;

    // Verify ownership
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id, instructor_id')
      .eq('id', id)
      .single();

    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (course.instructor_id !== instructor_id) return res.status(403).json({ error: 'Not authorized.' });

    // Collect all child IDs
    const { data: sections } = await supabaseAdmin.from('sections').select('id').eq('course_id', id);
    const sectionIds = (sections || []).map(s => s.id);

    if (sectionIds.length > 0) {
      const { data: topics } = await supabaseAdmin.from('topics').select('id').in('section_id', sectionIds);
      const topicIds = (topics || []).map(t => t.id);

      if (topicIds.length > 0) {
        const { data: lessons } = await supabaseAdmin.from('lessons').select('id').in('topic_id', topicIds);
        const lessonIds = (lessons || []).map(l => l.id);

        // Delete lesson-level data (ignore errors for tables that may not exist)
        if (lessonIds.length > 0) {
          await supabaseAdmin.from('bookmarks').delete().in('lesson_id', lessonIds).then(() => {}).catch(() => {});
          await supabaseAdmin.from('notes').delete().in('lesson_id', lessonIds).then(() => {}).catch(() => {});
          await supabaseAdmin.from('progress').delete().in('lesson_id', lessonIds).then(() => {}).catch(() => {});
          // Delete replies before comments
          const { data: comments } = await supabaseAdmin.from('comments').select('id').in('lesson_id', lessonIds);
          if (comments && comments.length > 0) {
            await supabaseAdmin.from('replies').delete().in('comment_id', comments.map(c => c.id)).then(() => {}).catch(() => {});
          }
          await supabaseAdmin.from('comments').delete().in('lesson_id', lessonIds).then(() => {}).catch(() => {});
          await supabaseAdmin.from('lessons').delete().in('topic_id', topicIds);
        }

        // Delete quizzes
        const { data: quizzes } = await supabaseAdmin.from('quizzes').select('id').in('topic_id', topicIds);
        const quizIds = (quizzes || []).map(q => q.id);
        if (quizIds.length > 0) {
          await supabaseAdmin.from('quiz_attempts').delete().in('quiz_id', quizIds).then(() => {}).catch(() => {});
          const { data: questions } = await supabaseAdmin.from('questions').select('id').in('quiz_id', quizIds);
          if (questions && questions.length > 0) {
            await supabaseAdmin.from('options').delete().in('question_id', questions.map(q => q.id)).then(() => {}).catch(() => {});
          }
          await supabaseAdmin.from('questions').delete().in('quiz_id', quizIds).then(() => {}).catch(() => {});
          await supabaseAdmin.from('quizzes').delete().in('topic_id', topicIds).then(() => {}).catch(() => {});
        }

        await supabaseAdmin.from('topics').delete().in('section_id', sectionIds);
      }
      await supabaseAdmin.from('sections').delete().eq('course_id', id);
    }

    // Delete course-level data
    await supabaseAdmin.from('reviews').delete().eq('course_id', id).then(() => {}).catch(() => {});
    await supabaseAdmin.from('certificates').delete().eq('course_id', id).then(() => {}).catch(() => {});
    await supabaseAdmin.from('payments').delete().eq('course_id', id).then(() => {}).catch(() => {});
    await supabaseAdmin.from('enrollments').delete().eq('course_id', id).then(() => {}).catch(() => {});

    // Finally delete the course
    const { error } = await supabaseAdmin.from('courses').delete().eq('id', id);
    if (error) throw error;

    return res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE course error:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete course.' });
  }
});

module.exports = router;
