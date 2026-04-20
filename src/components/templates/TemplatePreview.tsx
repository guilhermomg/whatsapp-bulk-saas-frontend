import { Template } from '@/lib/api/templates';

interface TemplatePreviewProps {
  template: Template;
  preview?: {
    header?: string | { type?: string; text?: string; url?: string };
    body: string | { text: string; variables?: string[] };
    footer?: string | { text?: string };
    buttons?: Array<{ type: string; text: string }>;
  };
}

export function TemplatePreview({ template, preview }: TemplatePreviewProps) {
  const displayData = preview || template.components;

  if (!displayData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <p className="text-sm text-gray-400 text-center">Fill in the form to see a preview</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Preview</h3>
      </div>

      {/* Phone Mock */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-1 shadow-2xl max-w-sm mx-auto">
        {/* Phone notch */}
        <div className="bg-gray-900 rounded-b-3xl rounded-t-2xl overflow-hidden">
          {/* Status bar */}
          <div className="bg-gray-800 text-white text-xs px-4 py-1 flex justify-between items-center">
            <span>9:41</span>
            <div className="flex gap-1">
              <span>📶</span>
              <span>📡</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Message Container */}
          <div className="bg-gray-100 p-3 space-y-3 min-h-48">
            {/* Header */}
            {displayData.header && typeof displayData.header === 'object' && displayData.header.text && (
              <div className="bg-blue-500 text-white rounded-lg p-3 text-sm max-w-xs">
                {displayData.header.text}
              </div>
            )}

            {/* Body */}
            <div className="bg-blue-500 text-white rounded-lg p-3 text-sm max-w-xs">
              {typeof displayData.body === 'string' ? displayData.body : displayData.body.text}
            </div>

            {/* Footer */}
            {displayData.footer && typeof displayData.footer === 'object' && displayData.footer.text && (
              <div className="bg-blue-500 text-white rounded-lg p-3 text-xs max-w-xs opacity-75">
                {displayData.footer.text}
              </div>
            )}

            {/* Buttons */}
            {displayData.buttons && displayData.buttons.length > 0 && (
              <div className="space-y-2 mt-4">
                {displayData.buttons.map((button, index) => (
                  <button
                    key={index}
                    disabled
                    className="w-full bg-white text-blue-500 border border-gray-300 rounded py-2 px-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-75"
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded p-3">
          <div className="text-xs text-gray-500">Variables</div>
          <div className="text-lg font-semibold text-gray-900">
            {(typeof displayData.body === 'object' && displayData.body.variables?.length) || 0}
          </div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <div className="text-xs text-gray-500">Buttons</div>
          <div className="text-lg font-semibold text-gray-900">
            {displayData.buttons?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
