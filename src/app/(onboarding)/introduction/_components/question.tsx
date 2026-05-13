import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type QuestionOption = {
    id: string;
    text: string;
    emoji?: string;
};

interface ReusableQuestionProps {
    greeting?: string;
    question: string;
    options: QuestionOption[];
    values?: string[];
    onToggle?: (value: string) => void;
}

const Question: React.FC<ReusableQuestionProps> = ({
    greeting = "Hi there!",
    question,
    options,
    values = [],
    onToggle,
}) => {
    return (
        <div className="w-full lg:w-1/2">
            <p className="font-sniglet-400 text-[16px] sm:text-[18px] text-[#484848] my-2 sm:my-3">
                {greeting}
            </p>
            <div className="font-poppins-400 font-normal">
                <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] leading-[30px] sm:leading-[34px] lg:leading-[38px] max-w-[400px] text-primary tracking-normal">
                    {question}
                </h1>
                <div className="my-5 sm:my-8 text-[#484848] space-y-3 sm:space-y-4">
                    {options.map(({ id, text, emoji }) => (
                        <Button
                            key={id}
                            type="button"
                            variant="ghost"
                            onClick={() => onToggle?.(id)}
                            aria-pressed={values.includes(id)}
                            className="h-auto w-full justify-start px-0 py-0 hover:bg-transparent"
                        >
                            <span className="flex items-start gap-3 text-left">
                                <span className="mt-1 h-4 w-4 min-h-4 min-w-4 shrink-0 rounded-full border-2 border-secondary flex items-center justify-center">
                                    <span
                                        className={`h-2 w-2 rounded-full bg-secondary transition-opacity ${values.includes(id) ? "opacity-100" : "opacity-0"
                                            }`}
                                    />
                                </span>
                                <Label className="text-[15px] sm:text-[16px] lg:text-[18px] leading-6 sm:leading-7 break-words whitespace-normal cursor-pointer">
                                    {emoji ? `${emoji} ${text}` : text}
                                </Label>
                            </span>
                        </Button>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default Question;
