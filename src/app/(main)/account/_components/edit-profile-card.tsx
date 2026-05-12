'use client'

import React, { useRef, useState, useTransition } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { updateProfilePhotoAction, updateProfileNameAction } from '@/lib/actions/profile'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EditProfileCardProps {
    currentImage: string | null
    currentName: string
    email: string
    planLabel: string
}

export default function EditProfileCard({
    currentImage,
    currentName,
    email,
    planLabel,
}: EditProfileCardProps) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Photo state
    const [preview, setPreview] = useState<string | null>(currentImage)
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoError, setPhotoError] = useState<string | null>(null)
    const [isUploadingPhoto, startPhotoTransition] = useTransition()

    // Name state
    const [nameValue, setNameValue] = useState(currentName)
    const [nameError, setNameError] = useState<string | null>(null)
    const [isSavingName, startNameTransition] = useTransition()

    const nameDirty = nameValue.trim() !== currentName
    const photoDirty = photoFile !== null
    const isDirty = nameDirty || photoDirty
    const isSaving = isUploadingPhoto || isSavingName

    const initial = currentName.charAt(0).toUpperCase() || 'U'

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            setPhotoError('Only JPEG, PNG, WebP, or GIF images are supported.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setPhotoError('Image must be smaller than 5 MB.')
            return
        }

        setPhotoError(null)
        setPhotoFile(file)
        setPreview(URL.createObjectURL(file))
        e.target.value = ''
    }

    async function handleSaveChanges() {
        setPhotoError(null)
        setNameError(null)

        if (photoDirty && photoFile) {
            const formData = new FormData()
            formData.append('photo', photoFile)
            await new Promise<void>((resolve) => {
                startPhotoTransition(async () => {
                    const result = await updateProfilePhotoAction(formData)
                    if (!result.success) {
                        setPhotoError(result.message)
                        setPreview(currentImage)
                        setPhotoFile(null)
                    } else {
                        setPhotoFile(null)
                    }
                    resolve()
                })
            })
        }

        if (nameDirty) {
            await new Promise<void>((resolve) => {
                startNameTransition(async () => {
                    const result = await updateProfileNameAction(nameValue)
                    if (!result.success) {
                        setNameError(result.message)
                    }
                    resolve()
                })
            })
        }

        router.refresh()
    }

    return (
        <Card className="border-subtle shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-[1rem] font-poppins-600 text-heading">
                    Profile Details
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center shadow">
                            {preview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={preview}
                                    alt={currentName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-3xl font-poppins-600">{initial}</span>
                            )}
                            {isUploadingPhoto && (
                                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                                    <Loader2 className="h-7 w-7 text-white animate-spin" />
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={isUploadingPhoto}
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 bg-secondary text-white rounded-lg p-1.5 border-2 border-white shadow-sm disabled:opacity-60 cursor-pointer"
                            aria-label="Change profile photo"
                        >
                            {isUploadingPhoto ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Camera className="h-3.5 w-3.5" />
                            )}
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {photoError && (
                        <p className="text-xs text-destructive font-poppins-400 text-center">{photoError}</p>
                    )}
                    <p className="text-xs text-muted-foreground font-poppins-400">
                        JPEG, PNG, WebP or GIF · max 5 MB
                    </p>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                    <Label htmlFor="full-name" className="text-xs text-muted-foreground font-poppins-400">
                        Full Name
                    </Label>
                    <Input
                        id="full-name"
                        value={nameValue}
                        onChange={(e) => {
                            setNameValue(e.target.value)
                            setNameError(null)
                        }}
                        maxLength={60}
                        disabled={isSaving}
                        className="font-poppins-500 text-dark rounded-xl border-subtle focus-visible:ring-secondary/30 focus-visible:border-secondary"
                        placeholder="Your full name"
                    />
                    {nameError && (
                        <p className="text-xs text-destructive font-poppins-400">{nameError}</p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-poppins-400">
                        Email Address
                    </Label>
                    <div className="flex items-center justify-between gap-3">
                        <Input
                            value={email}
                            disabled
                            className="font-poppins-500 text-dark rounded-xl border-subtle bg-muted/40"
                        />
                        <Badge
                            variant="secondary"
                            className="shrink-0 bg-surface-tint text-secondary font-poppins-500 rounded-lg"
                        >
                            Verified
                        </Badge>
                    </div>
                </div>

                {/* Plan */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-poppins-400">
                        Current Plan
                    </Label>
                    <div className="flex items-center justify-between gap-3">
                        <Input
                            value={planLabel}
                            disabled
                            className="font-poppins-500 text-dark rounded-xl border-subtle bg-muted/40"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 border-secondary text-secondary hover:bg-surface-tint font-poppins-600 rounded-xl"
                            onClick={() => router.push('/plans')}
                        >
                            Upgrade
                        </Button>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="justify-end pt-2">
                <Button
                    type="button"
                    disabled={!isDirty || isSaving}
                    onClick={handleSaveChanges}
                    className="bg-secondary hover:bg-landing-button-hover text-white font-poppins-600 rounded-xl px-6 disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving…
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}


