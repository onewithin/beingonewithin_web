import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type QuestionOption = {
    id: string;
    text: string;
    emoji?: string;
};

interface ReusableQuestionProps {
    greeting?: string;
    question: string;
    options: QuestionOption[];
    value?: string;
    onChange?: (value: string) => void;
}

const Question: React.FC<ReusableQuestionProps> = ({
    greeting = "Hi there!",
    question,
    options,
    value,
    onChange,
}) => {
    return (
        <div>
            <p className="font-sniglet-400 text-[20px] text-[#484848] my-3">
                {greeting}
            </p>
            <div className="font-poppins-400 font-normal">
                <h1 className="text-[32px] leading-[38px] max-w-[400px] text-primary tracking-normal">
                    {question}
                </h1>
                <RadioGroup
                    value={value}
                    className="my-8 text-[#484848]"
                    onValueChange={onChange}
                >
                    {options.map(({ id, text, emoji }) => (
                        <div key={id} className="flex items-center space-x-2">
                            <RadioGroupItem value={id} id={id} />
                            <Label htmlFor={id} className="text-[16px]">
                                {emoji ? `${emoji} ${text}` : text}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        </div>
    );
};

export default Question;
