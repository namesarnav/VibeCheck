'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ChatInterface } from '@/components/ChatInterface';
import { PlaylistView } from '@/components/PlaylistView';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { chatAPI } from '@/lib/api';
import { LogOut, Music } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [chatId, setChatId] = useState<string | null>(null);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleNewChat = async () => {
    setLoading(true);
    try {
      const response = await chatAPI.createChat();
      setChatId(response.data.chat.chatID);
      setCurrentPlaylistId(null);
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistCreated = (playlistId: string) => {
    setCurrentPlaylistId(playlistId);
  };

  useEffect(() => {
    // Create a new chat on mount if none exists
    if (!chatId && !loading) {
      handleNewChat();
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">VibeCheck</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.name || user?.username}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-6 flex gap-6">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col min-w-0">
            <Card className="flex-1 flex flex-col min-h-[600px]">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Chat</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChat}
                  disabled={loading}
                >
                  New Chat
                </Button>
              </div>
              <ChatInterface
                chatId={chatId}
                onPlaylistCreated={handlePlaylistCreated}
              />
            </Card>
          </div>

          {/* Playlist Section */}
          {currentPlaylistId && (
            <div className="w-96 flex-shrink-0">
              <PlaylistView
                playlistId={currentPlaylistId}
                onClose={() => setCurrentPlaylistId(null)}
              />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
