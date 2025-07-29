import React, { useState } from 'react';
import { Wand2, Download } from 'lucide-react';
import OpenAI from 'openai';

const VideoGenerator = () => {
  const [topic, setTopic] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const openai = new OpenAI({
    apiKey: "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",
    baseURL: "https://openrouter.ai/api/v1",
    dangerouslyAllowBrowser: true,
  });

  const generateVideoScript = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: "You are a meme coin education expert. Create engaging, humorous, and educational 15-second video scripts that explain meme coin concepts in simple terms. Include visual cues and make it entertaining while being informative."
          },
          {
            role: "user",
            content: `Create a 15-second educational video script about: ${topic}. The script should be fun, easy to understand, and include visual suggestions for a meme coin beginner.`
          }
        ],
        max_tokens: 300,
        temperature: 0.8
      });

      setGeneratedScript(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error generating script:', error);
      setGeneratedScript('Error generating script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a meme coin topic (e.g., 'How to spot rug pulls')"
          className="flex-1 input-field"
        />
        <button
          onClick={generateVideoScript}
          disabled={isGenerating || !topic.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Wand2 className="h-4 w-4" />
          <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
        </button>
      </div>

      {generatedScript && (
        <div className="bg-secondary-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-secondary-900">Generated Video Script</h4>
            <button className="text-primary-500 hover:text-primary-600 text-sm flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-secondary-200">
            <pre className="whitespace-pre-wrap text-sm text-secondary-700 font-mono">
              {generatedScript}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;