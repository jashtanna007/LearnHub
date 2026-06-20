const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { supabaseAdmin } = require('../config/supabase');

const COURSES = [
  {
    title: "DSA Masterclass",
    description: "Master Data Structures and Algorithms with comprehensive explanations and coding exercises in C++ and Java.",
    category: "Programming",
    price: 1999,
    thumbnail_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    sections: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming"]
  },
  {
    title: "Full Stack Web Development",
    description: "Build robust and scalable full stack web applications using React on the frontend and Node.js on the backend.",
    category: "Web Development",
    price: 2999,
    thumbnail_url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800",
    sections: ["Frontend with React", "Backend with Node.js", "Deployment"]
  },
  {
    title: "Machine Learning with Python",
    description: "Dive into the world of AI. Learn to build predictive models and analyze large datasets using Python.",
    category: "AI/ML",
    price: 3499,
    thumbnail_url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800",
    sections: ["ML Fundamentals", "Supervised Learning", "Neural Networks"]
  },
  {
    title: "Data Science Bootcamp",
    description: "A complete bootcamp covering statistics, data wrangling, visualization, and machine learning algorithms.",
    category: "Data Science",
    price: 2499,
    thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    sections: ["Python for Data Science", "Pandas & NumPy", "Visualization"]
  },
  {
    title: "Python for Beginners",
    description: "The perfect starting point for programming. Learn Python from scratch with hands-on projects.",
    category: "Programming",
    price: 999,
    thumbnail_url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
    sections: ["Python Basics", "Functions & OOP", "Projects"]
  }
];

const VIDEO_URLS = [
  "https://www.youtube.com/watch?v=8hly31xKli0",
  "https://www.youtube.com/watch?v=nu_pCVPKzTk",
  "https://www.youtube.com/watch?v=7eh4d6sabA0",
  "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
  "https://www.youtube.com/watch?v=rfscVS0vtbw"
];

async function seed() {
  try {
    console.log('🗑️  Cleaning existing data...');

    // Delete in dependency order
    await supabaseAdmin.from('bookmarks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('notes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('replies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('options').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('quiz_attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('quizzes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('topics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('sections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('certificates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ Cleaned existing data');

    // Get or create instructor
    let instructorId;
    const INSTRUCTOR_EMAIL = 'instructor@learnhub.com';

    const { data: existingInstructor } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'instructor')
      .limit(1)
      .single();

    if (existingInstructor) {
      instructorId = existingInstructor.id;
      console.log('📌 Using existing instructor:', instructorId);
    } else {
      console.log('👤 Creating instructor user...');
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: INSTRUCTOR_EMAIL,
        password: 'Instructor@12345',
        email_confirm: true,
      });

      if (authError) {
        // If user already exists in auth but not in users table
        if (authError.message?.includes('already')) {
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
          const existing = users.find(u => u.email === INSTRUCTOR_EMAIL);
          if (existing) {
            instructorId = existing.id;
            await supabaseAdmin.from('users').upsert({
              id: existing.id, name: 'Seed Instructor', email: INSTRUCTOR_EMAIL, role: 'instructor'
            });
          }
        } else {
          throw authError;
        }
      } else {
        instructorId = authData.user.id;
        await supabaseAdmin.from('users').insert({
          id: authData.user.id,
          name: 'Seed Instructor',
          email: INSTRUCTOR_EMAIL,
          role: 'instructor'
        });
      }
      console.log('✅ Instructor ready:', instructorId);
    }

    // Insert courses
    let videoIndex = 0;
    for (let i = 0; i < COURSES.length; i++) {
      const c = COURSES[i];
      console.log(`📚 Inserting: ${c.title}`);

      const { data: course, error: courseErr } = await supabaseAdmin
        .from('courses')
        .insert({
          title: c.title,
          description: c.description,
          category: c.category,
          price: c.price,
          thumbnail_url: c.thumbnail_url,
          instructor_id: instructorId,
          status: 'published'
        })
        .select()
        .single();

      if (courseErr) throw courseErr;

      for (let s = 0; s < 3; s++) {
        const { data: section, error: secErr } = await supabaseAdmin
          .from('sections')
          .insert({ course_id: course.id, title: c.sections[s], sort_order: s + 1 })
          .select()
          .single();
        if (secErr) throw secErr;

        for (let t = 0; t < 2; t++) {
          const topicTitle = `${c.sections[s]} — Part ${t + 1}`;
          const { data: topic, error: topErr } = await supabaseAdmin
            .from('topics')
            .insert({ section_id: section.id, title: topicTitle, sort_order: t + 1 })
            .select()
            .single();
          if (topErr) throw topErr;

          for (let l = 0; l < 3; l++) {
            const vidUrl = VIDEO_URLS[videoIndex % VIDEO_URLS.length];
            videoIndex++;
            const duration = 300 + Math.floor(Math.random() * 900); // 5-20 min
            const { error: lesErr } = await supabaseAdmin
              .from('lessons')
              .insert({
                topic_id: topic.id,
                title: `Lesson ${l + 1}: ${topicTitle} Concepts`,
                video_url: vidUrl,
                duration_seconds: duration,
                sort_order: l + 1
              });
            if (lesErr) throw lesErr;
          }
        }
      }
      console.log(`   ✅ Done: ${c.title}`);
    }

    console.log('\n🎉 Seeding completed! 5 courses with 90 total lessons inserted.');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
