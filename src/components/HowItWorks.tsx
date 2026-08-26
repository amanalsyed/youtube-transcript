import React from 'react';
import { Copy, Link2, Sparkles, FileText, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Copy the YouTube Video URL',
      description:
        'Open the YouTube video you want to transcribe and copy its URL from your browser or the YouTube share menu.',
      icon: <Link2 className="w-5 h-5 text-zinc-900" />,
    },
    {
      step: '02',
      title: 'Paste the URL',
      description:
        'Paste the YouTube link into the transcript generator above.',
      icon: <FileText className="w-5 h-5 text-zinc-900" />,
    },
    {
      step: '03',
      title: 'Generate the Transcript',
      description:
        'Click the generate button. The tool processes the video and prepares the transcript.',
      icon: <Sparkles className="w-5 h-5 text-zinc-900" />,
    },
    {
      step: '04',
      title: 'Read, Copy, or Download',
      description:
        'Once the transcript is ready, you can read it on the page. Copy the text or download it if the option is available.',
      icon: <Copy className="w-5 h-5 text-zinc-900" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 border-t border-zinc-200/60 bg-zinc-50/40 font-['Poppins',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        
        {/* Section: Generate a YouTube Transcript in Seconds */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight mb-4">
            Generate a YouTube Transcript in Seconds
          </h2>
          <div className="space-y-3 text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            <p className="font-semibold text-zinc-800">
              Need the transcript of a YouTube video?
            </p>
            <p>
              Our YouTube transcript generator lets you turn a supported YouTube video into readable text. Paste the video link and start the process.
            </p>
            <p>
              You can use the transcript to review a long video, find a specific part, take notes, or save the text for later.
            </p>
            <p>
              The tool is made to keep the process simple. You do not need to manually type the video word by word.
            </p>
          </div>
        </div>

        {/* Section: How to Get a Transcript From a YouTube Video */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              How to Get a Transcript From a YouTube Video
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-relaxed">
              Getting a transcript only takes a few steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item) => (
              <div
                key={item.step}
                className="relative p-6 bg-white rounded-2xl border border-zinc-200/70 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100/90 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-400">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Column Explanatory Cards: Convert YouTube Videos to Text & YouTube Transcript Extractor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: Convert YouTube Videos to Text */}
          <div className="p-7 sm:p-8 bg-white rounded-2xl border border-zinc-200/70 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mb-4">
                Convert YouTube Videos to Text
              </h3>
              <div className="space-y-3 text-sm text-zinc-600 leading-relaxed font-normal">
                <p>
                  A video can contain useful information that is hard to search or review by watching the whole thing.
                </p>
                <p className="font-medium text-zinc-800">
                  A transcript turns that spoken content into text.
                </p>
                <p>
                  You can use a YouTube video to transcript tool to turn supported videos into written content. This makes it easier to search for words, find key points, quote a section, or save information from a video.
                </p>
                <p>
                  You can also use the text with your own notes, documents, research, or other tools.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: YouTube Transcript Extractor */}
          <div className="p-7 sm:p-8 bg-white rounded-2xl border border-zinc-200/70 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mb-4">
                YouTube Transcript Extractor
              </h3>
              <div className="space-y-3 text-sm text-zinc-600 leading-relaxed font-normal">
                <p className="font-medium text-zinc-800">
                  Want to extract the transcript from a YouTube video?
                </p>
                <p>
                  Paste the video URL into our YouTube transcript extractor. If a transcript is available and the video is supported, the tool retrieves and prepares it for you.
                </p>
                <p>
                  A transcript may include timestamps when they are available.
                </p>
                <p className="text-zinc-500 text-xs sm:text-sm bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  Some videos may not work. This can happen when captions or other required video data are unavailable, restricted, or cannot be accessed by the tool. We prefer to tell you when something is not supported rather than promise that every YouTube video will work.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
