'use client';

import React, { useRef, useState, useTransition } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { updateProfilePhotoAction } from '@/lib/actions/profile';
import { useRouter } from 'next/navigation';

interface ProfilePhotoUploadProps {
    currentImage: string | null;
    profileInitial: string;
    profileName: string;
}

export default function ProfilePhotoUpload({
    currentImage,
    profileInitial,
    profileName,
}: ProfilePhotoUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(currentImage);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPEG, PNG, WebP, or GIF images are supported.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be smaller than 5 MB.');
            return;
        }

        setError(null);
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);

        const formData = new FormData();
        formData.append('photo', file);

        startTransition(async () => {
            const result = await updateProfilePhotoAction(formData);
            if (!result.success) {
                setError(result.message);
                setPreview(currentImage);
            } else {
                router.refresh();
            }
        });

        // Reset input so the same file can be re-selected if needed
        e.target.value = '';
    }

    return (
        <div className="relative">
            <div className="w-[150px] h-[150px] rounded-[25px] overflow-hidden border-5 border-[#F5F5F5] shadow-lg bg-white flex items-center justify-center">
                {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={preview}
                        alt={`${profileName} profile`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-[#1f5d57] text-white flex items-center justify-center font-poppins-600 text-5xl">
                        {profileInitial}
                    </div>
                )}

                {isPending && (
                    <div className="absolute inset-0 bg-black/40 rounded-[25px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            <button
                type="button"
                disabled={isPending}
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#1f5d57] rounded-md p-1 border-2 border-white cursor-pointer disabled:opacity-60"
                aria-label="Update profile photo"
                title="Update profile photo"
            >
                {isPending ? (
                    <Loader2 className="h-5 w-4 text-white animate-spin" />
                ) : (
                    <Camera className="h-5 w-4 text-white" />
                )}
            </button>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
            />

            {error && (
                <p className="absolute top-full left-1/2 -translate-x-1/2 mt-8 w-max max-w-[200px] text-center text-xs text-red-500 font-poppins-400">
                    {error}
                </p>
            )}
        </div>
    );
}
