import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useStorage() {
    const [uploading, setUploading] = useState(false);

    const uploadVoiceNote = async (file: Blob, candidateId: string) => {
        setUploading(true);
        try {
            const fileName = `${candidateId}/${Date.now()}.webm`;
            const { data, error } = await supabase.storage
                .from('voice-notes')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('voice-notes')
                .getPublicUrl(fileName);

            return publicUrl;
        } finally {
            setUploading(false);
        }
    };

    return { uploadVoiceNote, uploading };
}
