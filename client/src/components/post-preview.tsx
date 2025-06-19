import { formatDate } from "@/lib/utils";

interface PostPreviewProps {
  postId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export default function PostPreview({ postId, x, y, onClose }: PostPreviewProps) {
  // Clean the post ID
  const cleanPostId = postId.replace(/[\r\n\t]/g, '').trim();

  // Try to extract post data from DOM safely
  let postElement: Element | null = null;
  try {
    postElement = document.querySelector(`[data-post-id="${cleanPostId}"]`);
  } catch (error) {
    console.error('Error finding post element:', error);
  }
  
  if (!postElement) {
    return (
      <div
        className="absolute bg-white border-2 border-red-500 p-3 shadow-lg z-50 max-w-md cursor-pointer"
        style={{ left: Math.min(x, window.innerWidth - 300), top: Math.min(y, window.innerHeight - 150) }}
        onClick={onClose}
      >
        <div className="text-sm text-red-500">Post #{cleanPostId} not found</div>
      </div>
    );
  }

  // Extract data from DOM
  const contentElement = postElement.querySelector('.text-xs.leading-relaxed');
  const nameElement = postElement.querySelector('.font-bold');
  const timeElement = postElement.querySelector('.text-gray-600');
  const imageElement = postElement.querySelector('img');

  const content = contentElement?.textContent || '';
  const name = nameElement?.textContent?.split('!')[0]?.trim() || "Anonymous";
  const tripcode = nameElement?.textContent?.includes('!') ? nameElement.textContent.split('!')[1]?.trim() : null;
  const imageUrl = imageElement?.getAttribute('src');
  const imageName = imageElement?.getAttribute('alt');

  const formatContent = (content: string) => {
    if (!content) return "";
    
    return content.split('\n').map((line, index) => {
      // Handle greentext
      if (line.startsWith('>') && !line.startsWith('>>')) {
        return (
          <div key={index} className="text-green-600 font-bold">
            {line}
          </div>
        );
      }
      
      // Handle quote links
      const parts = line.split(/(>>(\d+))/g);
      return (
        <div key={index}>
          {parts.map((part, partIndex) => {
            if (part.match(/^>>(\d+)$/)) {
              const quotedId = part.match(/^>>(\d+)$/)?.[1];
              return (
                <span key={partIndex} className="text-blue-600 underline">
                  &gt;&gt;No. {quotedId}
                </span>
              );
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <div
      className="absolute bg-white border-2 border-red-500 p-3 shadow-lg z-50 max-w-md cursor-pointer"
      style={{ 
        left: Math.min(x, window.innerWidth - 400), 
        top: Math.min(y, window.innerHeight - 200) 
      }}
      onClick={onClose}
    >
      <div className="mb-2 text-xs">
        <span className="font-bold text-green-600">
          {name}
          {tripcode && (
            <span className="text-blue-600">
              {' '}!{tripcode}
            </span>
          )}
        </span>
        <span className="text-gray-600 ml-2">{new Date().toLocaleDateString()}</span>
        <span className="text-blue-600 ml-2">No. {cleanPostId}</span>
      </div>
      
      {imageUrl && (
        <div className="mb-2">
          <img
            src={imageUrl}
            alt={imageName || "Post image"}
            className="max-w-full max-h-32 border cursor-pointer"
          />
          {imageName && (
            <div className="text-xs text-gray-600 mt-1">
              {imageName}
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs leading-relaxed max-h-32 overflow-y-auto">
        {formatContent(content)}
      </div>
    </div>
  );
}