import React, { useState, useEffect } from 'react';

// Define interfaces to match Pydantic schemas from backend
interface LiveNovelEntity {
  id: string;
  name: string;
  type?: string;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
}

interface LiveNovelChapter {
  title: string;
  content: string; // HTML-like string with <entity> tags
}

interface LiveNovelData {
  project_id: string;
  title: string;
  chapters: LiveNovelChapter[];
  entities: Record<string, LiveNovelEntity>; // Keyed by entity ID
}

function App() {
  const [novelData, setNovelData] = useState<LiveNovelData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const projectIdFromUrl = new URLSearchParams(window.location.search).get('project_id');
  const projectId = projectIdFromUrl || 'test_project_for_web_novel'; // Default for testing

  useEffect(() => {
    if (!projectId) {
      setError("Project ID is missing. Please provide it as a URL parameter (e.g., ?project_id=your_id).");
      setLoading(false);
      return;
    }

    const fetchNovelData = async () => {
      setLoading(true);
      setError(null);
      // Use environment variable for API base URL for flexibility
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      try {
        const response = await fetch(`${apiBaseUrl}/api/projects/${projectId}/live-novel-data`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({{ detail: response.statusText }}));
          throw new Error(`Failed to fetch novel data (${response.status}): ${errorData.detail || response.statusText}`);
        }
        const data: LiveNovelData = await response.json();
        setNovelData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred during data fetching.");
        console.error("Error fetching novel data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNovelData();
  }, [projectId]); // Re-fetch if projectId changes

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">جاري تحميل بيانات الرواية...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-xl text-red-600 p-4">خطأ: {error}</div>;
  }

  if (!novelData) {
    return <div className="flex justify-center items-center min-h-screen text-xl">لم يتم العثور على بيانات الرواية للمشروع المحدد.</div>;
  }

  return (
    <div className="container mx-auto p-4 font-sans max-w-4xl" dir="rtl">
      <header className="my-8 text-center">
        <h1 className="text-5xl font-bold text-gray-800">{novelData.title}</h1>
      </header>

      <main className="space-y-8">
        {novelData.chapters.map((chapter, index) => (
          <section key={index} className="bg-white shadow-xl rounded-lg p-6 md:p-8">
            <h2 className="text-3xl font-semibold mb-6 text-gray-700 border-b pb-3">{chapter.title}</h2>
            {/* TODO: Replace with a proper ChapterViewer component that handles <entity> tags */}
            <div
              className="prose prose-lg max-w-none prose-p:my-3 prose-headings:my-4 prose-headings:font-semibold"
              dangerouslySetInnerHTML={{ __html: chapter.content }}
            />
          </section>
        ))}

        {Object.keys(novelData.entities).length > 0 && (
          <section className="mt-10 bg-gray-50 shadow-lg rounded-lg p-6 md:p-8">
              <h2 className="text-3xl font-semibold mb-6 text-gray-700 border-b pb-3">الكيانات المذكورة</h2>
              <ul className="space-y-3">
                  {Object.entries(novelData.entities).map(([id, entity]) => (
                      <li key={id} className="p-3 border rounded-md bg-white hover:shadow-md transition-shadow">
                          <h3 className="font-bold text-lg text-blue-600">{entity.name}</h3>
                          {entity.type && <p className="text-sm text-gray-500">النوع: {entity.type}</p>}
                          {entity.description && <p className="text-md text-gray-700 mt-1">{entity.description}</p>}
                          {/* TODO: Add popup or link for more entity details / image */}
                      </li>
                  ))}
              </ul>
          </section>
        )}
      </main>
      <footer className="text-center py-8 mt-10 text-gray-500">
        <p>عارض الرواية التفاعلية - الإصدار 0.1.0</p>
      </footer>
    </div>
  );
}

export default App;
