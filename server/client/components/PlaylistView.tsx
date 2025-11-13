'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { playlistAPI } from '@/lib/api';
import { Music, ExternalLink, Loader2 } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  previewUrl?: string;
  externalUrl?: string;
  image?: string;
}

interface PlaylistViewProps {
  playlistId: string;
  onClose?: () => void;
}

export function PlaylistView({ playlistId, onClose }: PlaylistViewProps) {
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  const loadPlaylist = async () => {
    try {
      const response = await playlistAPI.getPlaylist(playlistId);
      setPlaylist(response.data.playlist);
      // In a real app, you'd fetch track details from Spotify
      // For now, we'll just show the track IDs
    } catch (error) {
      console.error('Failed to load playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToSpotify = async () => {
    // This would require Spotify OAuth token
    // For now, show a message
    setPublishing(true);
    try {
      // In a real implementation, you'd get the Spotify token from the auth context
      // await playlistAPI.publishToSpotify(playlistId, spotifyToken);
      alert('Spotify integration: Connect your Spotify account first');
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!playlist) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center text-muted-foreground">
          Playlist not found
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{playlist.title}</CardTitle>
            {playlist.description && (
              <CardDescription className="mt-2">{playlist.description}</CardDescription>
            )}
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary">
            <Music className="h-3 w-3 mr-1" />
            {playlist.tracks?.length || 0} tracks
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {playlist.tracks && playlist.tracks.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Playlist created! You can now publish it to Spotify or make changes.
              </p>
              <div className="space-y-2">
                {playlist.tracks.slice(0, 10).map((trackId: string, index: number) => (
                  <div
                    key={trackId}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted"
                  >
                    <span className="text-muted-foreground w-6">{index + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Track {trackId.slice(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">Track details from Spotify</p>
                    </div>
                  </div>
                ))}
                {playlist.tracks.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{playlist.tracks.length - 10} more tracks
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No tracks in this playlist</p>
          )}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handlePublishToSpotify} disabled={publishing} className="flex-1">
              {publishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Publish to Spotify
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

