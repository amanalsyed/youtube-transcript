import React from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle, Layers, Lock } from 'lucide-react';

export const HowTranscriptionWorks: React.FC = () => {
  return (
    <section id="transcription-details" className="py-16 sm:py-20 bg-zinc-50/40 border-t border-zinc-200/60 font-['Poppins',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* How Our YouTube Transcription Works */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight mb-4">
            How Our YouTube Transcription Works
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-zinc-600 leading-relaxed text-left sm:text-center font-normal">
            <p>
              The process starts with the YouTube video URL you provide.
            </p>
            <p>
              The tool identifies the video and checks the information needed to produce a transcript. Depending on the video and the available data, the transcript may come from available captions or transcription processing.
            </p>
            <p>
              The resulting text is then prepared for reading and use.
            </p>
            <p>
              Not every video has the same caption or audio conditions. Video length, language, audio quality, speakers, background noise, and available captions can affect the result.
            </p>
            <p className="font-semibold text-zinc-800">
              That is why transcript quality can vary from one video to another.
            </p>
          </div>
        </div>

        {/* Accuracy and Supported Videos */}
        <div className="pt-12 border-t border-zinc-200/60">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight">
              Accuracy and Supported Videos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* How Accurate Are YouTube Transcripts? */}
            <div className="p-6 sm:p-7 bg-white rounded-2xl border border-zinc-200/70 shadow-xs flex flex-col justify-start">
              <div className="w-10 h-10 rounded-xl bg-zinc-100/90 flex items-center justify-center mb-4">
                <HelpCircle className="w-5 h-5 text-zinc-900" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-3">
                How Accurate Are YouTube Transcripts?
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                <p>
                  Accuracy depends on the source and the way the speech is captured.
                </p>
                <p>
                  Clear audio and well-spoken content usually produce better results. Background noise, strong accents, overlapping speakers, music, and technical terms can make transcription harder.
                </p>
                <p className="font-medium text-zinc-800 pt-1">
                  A transcript should be checked before using it as a source for important work.
                </p>
              </div>
            </div>

            {/* Which YouTube Videos Are Supported? */}
            <div className="p-6 sm:p-7 bg-white rounded-2xl border border-zinc-200/70 shadow-xs flex flex-col justify-start">
              <div className="w-10 h-10 rounded-xl bg-zinc-100/90 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-zinc-900" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-3">
                Which YouTube Videos Are Supported?
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                <p>
                  The tool is designed for supported public YouTube videos.
                </p>
                <p>
                  Some videos may not be available for transcription. Restrictions, missing captions, unavailable data, or other YouTube limitations can prevent a transcript from being generated.
                </p>
              </div>
            </div>

            {/* Why Can't I Generate a Transcript? */}
            <div className="p-6 sm:p-7 bg-white rounded-2xl border border-zinc-200/70 shadow-xs flex flex-col justify-start">
              <div className="w-10 h-10 rounded-xl bg-zinc-100/90 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-zinc-900" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-3">
                Why Can't I Generate a Transcript?
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                <p>
                  If a transcript cannot be created, the video may not have the required captions or data available to the tool.
                </p>
                <p>
                  Try another public video to check whether the issue is specific to that video.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy and Security */}
        <div className="pt-12 border-t border-zinc-200/60 max-w-4xl mx-auto">
          <div className="p-7 sm:p-8 bg-white rounded-2xl border border-zinc-200/70 shadow-xs text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mb-2">
                Privacy and Security
              </h2>
              <div className="space-y-2 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                <p className="font-semibold text-zinc-800">
                  We believe you should know what happens to your data.
                </p>
                <p>
                  We do not store your personal transcripts on external servers or sell your data. Videos are processed securely to provide instant transcript access.
                </p>
                <p>
                  We do not make claims about privacy or security that the product cannot support. See our Privacy Policy for the exact details of how URLs, transcripts, and other information are handled.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
