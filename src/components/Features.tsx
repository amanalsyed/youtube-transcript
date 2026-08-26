import React from 'react';
import {
  Zap,
  BookOpen,
  Clock,
  Copy,
  Download,
  Globe,
  Monitor,
  Search,
  CheckCircle2,
  Brain,
  GraduationCap,
  Video,
  FileCheck,
  TrendingUp,
  Briefcase,
  Languages,
  Layers,
  Sparkles,
} from 'lucide-react';

export const Features: React.FC = () => {
  const whyUseItems = [
    {
      icon: <Zap className="w-5 h-5 text-zinc-900" />,
      title: 'Fast YouTube Transcription',
      description: 'Get your transcript without typing the video yourself. Paste the link and let the tool handle the work.',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-zinc-900" />,
      title: 'Easy to Read',
      description: 'The generated transcript is presented as text so you can read through the content without watching the full video again.',
    },
    {
      icon: <Clock className="w-5 h-5 text-zinc-900" />,
      title: 'Timestamps',
      description: 'Where supported, timestamps help you find the part of the video connected to a line of text.',
    },
    {
      icon: <Copy className="w-5 h-5 text-zinc-900" />,
      title: 'Copy the Transcript',
      description: 'Copy the transcript and use it in your notes, documents, research, or content workflow.',
    },
    {
      icon: <Download className="w-5 h-5 text-zinc-900" />,
      title: 'Download the Transcript',
      description: 'Save your transcript for later when downloading is supported.',
    },
    {
      icon: <Globe className="w-5 h-5 text-zinc-900" />,
      title: 'Multiple Languages',
      description: 'If language options are available for the video and supported by the tool, you can work with transcripts in different languages.',
    },
    {
      icon: <Monitor className="w-5 h-5 text-zinc-900" />,
      title: 'No Software to Install',
      description: 'Everything happens in your browser. There is no desktop program to install.',
    },
  ];

  const whatCanYouDoItems = [
    {
      icon: <BookOpen className="w-5 h-5 text-zinc-900" />,
      title: 'Take Notes Faster',
      description: 'Turn a long lecture, tutorial, or presentation into text that you can scan and review.',
    },
    {
      icon: <Search className="w-5 h-5 text-zinc-900" />,
      title: 'Research a Topic',
      description: 'Search the transcript for names, terms, ideas, and sections that matter to your research.',
    },
    {
      icon: <Clock className="w-5 h-5 text-zinc-900" />,
      title: 'Review Long Videos',
      description: 'You do not always need to watch an hour-long video again to find one piece of information. A transcript makes the content easier to scan.',
    },
    {
      icon: <Copy className="w-5 h-5 text-zinc-900" />,
      title: 'Repurpose Video Content',
      description: 'Creators can use their own transcripts as a starting point for articles, notes, social posts, scripts, and other content.',
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-zinc-900" />,
      title: 'Study YouTube Lectures',
      description: 'Students can use transcripts to review lessons and return to important parts of a lecture.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-zinc-900" />,
      title: 'Analyze Video Content',
      description: 'Researchers, marketers, and SEO professionals can use transcript text when studying video content and topics.',
    },
  ];

  const aiBenefits = [
    'Summarize a long video',
    'Find the main points',
    'Create study notes',
    'Ask questions about the video',
    'Find specific information',
    'Turn a video into an outline',
    'Repurpose your own video content',
  ];

  const whoCanUseItems = [
    {
      icon: <GraduationCap className="w-5 h-5 text-zinc-900" />,
      title: 'Students and Researchers',
      description: 'Get written text from lectures, interviews, tutorials, and research videos. Search the transcript instead of going through the whole video again.',
    },
    {
      icon: <Video className="w-5 h-5 text-zinc-900" />,
      title: 'Content Creators',
      description: 'Use transcripts to review your videos and turn existing ideas into new content.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-zinc-900" />,
      title: 'SEO Specialists',
      description: 'Study the spoken content of videos and use transcripts during content and topic research.',
    },
    {
      icon: <Layers className="w-5 h-5 text-zinc-900" />,
      title: 'Video Editors',
      description: 'Find spoken sections quickly and locate parts of a video that need editing.',
    },
    {
      icon: <Briefcase className="w-5 h-5 text-zinc-900" />,
      title: 'Professionals',
      description: 'Save useful information from webinars, presentations, interviews, and other videos.',
    },
    {
      icon: <Languages className="w-5 h-5 text-zinc-900" />,
      title: 'Language Learners',
      description: 'Read along with video content and compare spoken language with written text.',
    },
  ];

  const featuresList = [
    {
      title: 'YouTube Video Transcription',
      description: 'Turn supported YouTube videos into readable text.',
    },
    {
      title: 'Timestamped Transcripts',
      description: 'Find parts of a video more easily when timestamps are available.',
    },
    {
      title: 'Copy and Download',
      description: 'Keep a copy of useful transcript text for your own work.',
    },
    {
      title: 'Clean Transcript Output',
      description: 'Read the generated text without having to manually type the spoken content.',
    },
    {
      title: 'Language Support',
      description: 'Work with supported languages instead of limiting your research to English videos.',
    },
    {
      title: 'Browser Based',
      description: 'Use the tool from a web browser without installing software.',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 bg-white border-t border-zinc-200/60 font-['Poppins',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

        {/* 1. Why Use Our YouTube Transcript Generator? */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight">
              Why Use Our YouTube Transcript Generator?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {whyUseItems.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-zinc-200/70 bg-zinc-50/40 hover:bg-zinc-50 transition-all hover:border-zinc-300 flex flex-col justify-start"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200/70 flex items-center justify-center mb-4 shadow-2xs">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. What Can You Do With a YouTube Transcript? */}
        <div className="pt-8 border-t border-zinc-100">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight mb-3">
              What Can You Do With a YouTube Transcript?
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              A transcript is useful beyond simply reading a video.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whatCanYouDoItems.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-zinc-200/70 bg-white shadow-xs hover:border-zinc-300 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100/90 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Use YouTube Transcripts With AI */}
        <div className="pt-8 border-t border-zinc-100">
          <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900 text-white shadow-lg relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 mb-4">
                <Brain className="w-3.5 h-3.5 text-amber-300" />
                AI Workflows
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                Use YouTube Transcripts With AI
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                A transcript also gives you text that can be used with AI tools. For example, you can use a transcript to:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {aiBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-200 font-normal">
                    <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <p className="text-zinc-400 text-xs sm:text-sm italic font-normal">
                The transcript gives the AI the text it needs to work with.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Who Can Use a YouTube Transcript Generator? */}
        <div className="pt-8 border-t border-zinc-100">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight">
              Who Can Use a YouTube Transcript Generator?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whoCanUseItems.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-zinc-200/70 bg-zinc-50/40 hover:bg-zinc-50 transition-all hover:border-zinc-300"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200/70 flex items-center justify-center mb-4 shadow-2xs">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. YouTube Transcript Features */}
        <div className="pt-8 border-t border-zinc-100">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight">
              YouTube Transcript Features
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-zinc-200/70 bg-white shadow-xs hover:border-zinc-300 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                  <h3 className="text-base font-bold text-zinc-900">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal pl-6">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
