import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import CoursePlayer from '@/components/landing/CoursePlayer';
import { courses, Course } from '@/data/course';

const Courses = () => {
  const [openCourse, setOpenCourse] = useState<Course | null>(null);

  return (
    <section id="courses" className="py-24 relative">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="text-sm font-semibold text-gradient uppercase tracking-widest">Каталог</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl mt-3 leading-tight">
              Курсы, которые <span className="text-gradient">качают навык</span>
            </h2>
            <p className="text-muted-foreground mt-3">
              12 практических курсов по запуску проекта — от идеи до оценки удовлетворенности потребителя
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="group glass rounded-3xl p-6 border-primary/40 glow transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon name={c.icon} size={24} className="text-white" />
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                  {c.level}
                </span>
              </div>

              <h3 className="font-display font-bold text-lg mb-2 leading-snug">{c.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{c.description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                <span className="flex items-center gap-1.5">
                  <Icon name="PlayCircle" size={16} />
                  {c.lessons.length} {c.lessons.length === 1 ? 'задание' : 'задания'}
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Icon name="Zap" size={16} />
                  +{c.lessons.reduce((s, l) => s + l.xp, 0)} XP
                </span>
              </div>

              <Button
                onClick={() => setOpenCourse(c)}
                className="w-full bg-gradient-brand hover:opacity-90 border-0 text-white rounded-xl font-semibold"
              >
                <Icon name="GraduationCap" size={17} className="mr-1.5" />
                Пройти курс
              </Button>
            </div>
          ))}
        </div>
      </div>

      <CoursePlayer course={openCourse} onOpenChange={(v) => !v && setOpenCourse(null)} />
    </section>
  );
};

export default Courses;
