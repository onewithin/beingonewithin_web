"use client";

import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [showInitial, setShowInitial] = useState(false);
  const [moveLogo, setMoveLogo] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showAuthor, setShowAuthor] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => {
        setShowInitial(true);
      }, 1000),

      setTimeout(() => {
        setMoveLogo(true);
      }, 2800),

      setTimeout(() => {
        setShowBackground(true);
        setShowText(true);
      }, 3800),

      setTimeout(() => {
        setShowAuthor(true);
        setShowButton(true);
      }, 7600),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!showButton) return;

    const redirectTimer = setTimeout(() => {
      router.push("/sign-in");
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [showButton, router]);

  return (
    <div className="relative h-screen overflow-hidden bg-landing-gradient">
      <AnimatePresence>
        {showInitial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute top-0 left-0 right-0 flex justify-center"
          >
            <Image
              src="/images/carehand.png"
              alt="care hand"
              width={600}
              height={600}
              className="w-[90%] max-w-[500px]"
            />
          </motion.div>
        )}
      </AnimatePresence>


      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{
            y: 0,
            scale: 1,
            opacity: 0,
          }}
          animate={{
            opacity: showInitial ? 1 : 0,
            y: moveLogo ? -180 : 0,
            scale: moveLogo ? 0.38 : 1,
          }}
          transition={{
            duration: 1,
            ease: [0.175, 0.885, 0.32, 1.275],
          }}
          className="absolute"
        >
          <Image
            src="/icons/logo.png"
            alt="logo"
            width={showInitial ? 250 : 450}
            height={showInitial ? 250 : 450}
          />
        </motion.div>

        <AnimatePresence>
          {showInitial && !moveLogo && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-[190px]"
              >
                {/* <Image
                  src="/images/with-prana-label.png"
                  alt="label"
                  width={220}
                  height={60}
                /> */}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-[150px] text-landing-primary italic text-sm"
              >
                Reconnect. Heal. Awaken.
              </motion.p>
            </>
          )}
        </AnimatePresence>

        {showText && (
          <div className="text-center px-4">
            <TypewriterText />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: showAuthor ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 text-lg text-landing-primary font-poppins-400"
            >
              — Rumi
            </motion.p>
          </div>
        )}

        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute bottom-10"
            >
              <Link href="/sign-in">
                <Button className="bg-landing-button font-poppins-700 hover:bg-landing-button-hover text-[16px] h-11 w-[115px]  px-8 rounded-lg text-white shadow-xl">
                  Begin
                  <MoveRight className="ml-2 !w-5 !h-5" />
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TypewriterText() {
  const text = "Silence is not empty\nIt’s full of answers";

  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      setDisplayed(text.slice(0, index));
      index++;

      if (index > text.length) {
        clearInterval(interval);
      }
    }, 70);

    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="whitespace-pre-line text-center text-[32px] md:text-[42px] leading-tight text-landing-primary font-sniglet-400">
      {displayed}
    </h1>
  );
}