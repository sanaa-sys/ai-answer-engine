"use client";

import Link from "next/link";
import { useState, ChangeEvent, FormEvent } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import React from "react";

import { motion } from "framer-motion"; // Import framer-motion

const Login: React.FC = () => {
    const [password, setPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
 

    const handleLogin = async (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signInWithEmailAndPassword(email, password);
            setEmail(email); 
            toast.success("Logged in successfully!");
            router.push("/home");
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    return (
        <>
            {/* ToastContainer moved to the root */}
            <ToastContainer />

            <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 bg-gradient-to-tr from-indigo-200 via-zinc-50 to-indigo-300 overflow-hidden">
                {/* Image Section */}
                <motion.div
                    className="flex items-center justify-center min-h-screen"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    <img src="/logo1.jpg" alt="Logo" className="center w-auto h-full object-cover" />
                </motion.div>

                <motion.div
                    className="flex items-center justify-center py-12 min-h-screen"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5 }}
                >
                    <div className="mx-auto grid w-[350px] gap-6">
                        <div className="grid gap-2 text-center">
                            <h1 className="text-xl font-bold">Welcome to Virtual Store</h1>
                            <h1 className="text-xl font-bold">Login</h1>
                            <p className="text-muted-foreground">
                                Enter your email below to login to your account
                            </p>
                        </div>
                        <div className="grid gap-4">
                            <div className="grid gap-2 no-scrollbar">
                                <label htmlFor="email">Email</label>
                                <motion.input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                    className="w-full p-2 border rounded"
                                    whileFocus={{ scale: 1.05 }}
                                />
                            </div>

                            <div className="grid gap-2 no-scrollbar">
                                <label htmlFor="password">Password</label>
                                <motion.input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full p-2 border rounded"
                                    whileFocus={{ scale: 1.05 }}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </Button>
                        </div>

                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="underline">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default Login;