
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Zap, Clock, Shield, Users, TrendingUp, Globe, Award } from "lucide-react";
import Image from "next/image";

export function TiltedCardsSection() {
    const stats = [
        {
            icon: Users,
            value: "10k+",
            label: "Empresas",
            color: "bg-blue-500",
        },
        {
            icon: TrendingUp,
            value: "$50M+",
            label: "Desembolsados",
            color: "bg-green-500",
        },
        {
            icon: Globe,
            value: "98%",
            label: "Aprobación",
            color: "bg-purple-500",
        },
        {
            icon: Award,
            value: "24/7",
            label: "Soporte",
            color: "bg-orange-500",
        },
    ];

    const features = [
        {
            icon: Clock,
            title: "Aprobación en 24 horas",
            description: "Sabemos que el tiempo es dinero. Recibe respuesta a tu solicitud en tiempo récord.",
        },
        {
            icon: Zap,
            title: "Desembolso Inmediato",
            description: "Una vez aprobado, transferimos los recursos a tu cuenta el mismo día.",
        },
        {
            icon: Shield,
            title: "Sin Costos Ocultos",
            description: "Transparencia total. Conoce todas las condiciones desde el primer momento.",
        },
    ];

    return (
        <section className="py-32 bg-navy relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />

            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Stats Cards Grid */}
                    <div className="grid grid-cols-2 gap-6 perspective-1000">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50, rotateY: -10 }}
                                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                                whileHover={{ scale: 1.05, rotateY: 5, zIndex: 10 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="transform transition-all duration-500"
                            >
                                <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300 h-full group overflow-hidden relative">
                                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`} />
                                    <CardContent className="p-6 flex flex-col items-center text-center space-y-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                                            <p className="text-sm text-blue-200/80 font-medium">{stat.label}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Column: Content */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-5xl font-montserrat font-bold text-white leading-tight"
                            >
                                En Wy Credito vamos <br />
                                <span className="text-primary">más allá</span> para impulsarte
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                viewport={{ once: true }}
                                className="text-lg text-blue-100/80 leading-relaxed max-w-lg"
                            >
                                No somos solo una financiera, somos tu aliado estratégico. Diseñamos soluciones que se adaptan al ritmo de tu negocio.
                            </motion.p>
                        </div>

                        <div className="space-y-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                                    viewport={{ once: true }}
                                    className="flex gap-6 group"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                                        <feature.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                        <p className="text-blue-100/60 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

