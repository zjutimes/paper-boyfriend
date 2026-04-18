"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useVIP } from "@/context/VIPContext";
import { PaymentModal } from "./PaymentModal";
import { CustomerServiceButton } from "./CustomerService";
import { ShareButton } from "./ShareModal";
import { CountdownBanner } from "./ui/the-future-arrives-soon-cta";
import Image from "next/image";

const AVATARS = {
    "pan-an": "https://coze-coding-project.tos.coze.site/coze_storage_7629655528343568394/image/generate_image_2615bc43-9858-4b77-9af2-90633da989bc.jpeg",
    "song-yu": "https://coze-coding-project.tos.coze.site/coze_storage_7629655528343568394/image/generate_image_0165eb93-3528-495d-99a4-0f3d9721695c.jpeg",
    "wei-jie": "https://coze-coding-project.tos.coze.site/coze_storage_7629655528343568394/image/generate_image_d9783b55-25a2-48b4-b1ed-bb7e82ac2f97.jpeg",
    "lan-ling": "https://coze-coding-project.tos.coze.site/coze_storage_7629655528343568394/image/generate_image_2a53fbbd-8249-49d2-b51c-bd6aee3b6157.jpeg"
};

export function LandingPage() {
    const {
        user,
        signOut
    } = useAuth();

    const {
        selectCharacter
    } = useChat();

    const { vipStatus } = useVIP();
    const [showLogin, setShowLogin] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const handlePaymentSuccess = (plan: string) => {
        console.log('VIP activated:', plan);
    };

    const characters = [{
        id: "pan-an",
        name: "潘安",
        dynasty: "西晋",
        desc: "温润如玉，世家公子",
        color: "from-amber-100 to-orange-100",
        icon: "🏛️",
        avatar: AVATARS["pan-an"]
    }, {
        id: "song-yu",
        name: "宋玉",
        dynasty: "楚国",
        desc: "浪漫才子，辞赋家",
        color: "from-purple-100 to-pink-100",
        icon: "📜",
        avatar: AVATARS["song-yu"]
    }, {
        id: "wei-jie",
        name: "卫玠",
        dynasty: "魏晋",
        desc: "病弱清俊，玉人",
        color: "from-blue-100 to-cyan-100",
        icon: "🌙",
        avatar: AVATARS["wei-jie"]
    }, {
        id: "lan-ling",
        name: "兰陵王",
        dynasty: "北齐",
        desc: "冷峻战神，反差萌",
        color: "from-gray-100 to-slate-100",
        icon: "⚔️",
        avatar: AVATARS["lan-ling"]
    }];

    const features = [{
        title: "AI智能对话",
        desc: "会主动关心你，记得你说过的每句话",
        icon: "💬"
    }, {
        title: "温柔语音",
        desc: "每句情话都有专属语音，听他轻声说想你",
        icon: "🎵"
    }, {
        title: "独家自拍",
        desc: "他会在合适的时机，给你发自拍照",
        icon: "📸"
    }, {
        title: "24小时陪伴",
        desc: "早安晚安，随时随地，他在等你",
        icon: "🌙"
    }];

    const testimonials = [{
        name: "小雅",
        text: "选了潘安，每天早上看到他发的早安，整个人都甜甜的",
        avatar: "雅"
    }, {
        name: "小鱼",
        text: "宋玉太会撩了！随口一句话就让我脸红",
        avatar: "鱼"
    }, {
        name: "小语",
        text: "兰陵王冷冷的但关键时刻超温柔，爱了",
        avatar: "语"
    }];

    const steps = [{
        num: "01",
        title: "登录/注册",
        desc: "创建账户，保存你的心动记录"
    }, {
        num: "02",
        title: "选择你的男友",
        desc: "从四大美男中，选择一位心动对象"
    }, {
        num: "03",
        title: "开始聊天",
        desc: "像微信一样，发送消息，收到回复"
    }];

    const handleSelectCharacter = (characterId: string) => {
        const {
            getCharacterWithPrompt
        } = require("@/data/characters");

        const character = getCharacterWithPrompt(characterId as any);
        selectCharacter(character);
    };

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {}
            <nav
                className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <h1
                        className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">纸片人男友
                                  </h1>
                    {user ? <div className="flex items-center gap-4">
                        {/* VIP Button */}
                        {vipStatus.isVIP ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold rounded-full">
                                <span>👑</span>
                                <span>VIP会员</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowPayment(true)}
                                className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all">
                                开通VIP
                            </button>
                        )}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white text-sm font-medium">
                                {user.nickname?.charAt(0) || user.email?.charAt(0) || "U"}
                            </div>
                            <span className="text-sm text-gray-700">{user.nickname || user.email}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-500 hover:text-gray-700">退出
                                          </button>
                    </div> : <div className="flex items-center gap-3">
                        {/* 分享按钮 */}
                        <ShareButton />
                        <button
                            onClick={() => setShowPayment(true)}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold rounded-full hover:shadow-lg transition-all">
                            👑 开通VIP
                        </button>
                        <button
                            onClick={() => setShowLogin(true)}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all">登录 / 注册
                                    </button>
                    </div>}
                </div>
            </nav>
            {}
            <section
                className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-24 pb-20 px-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                    <div
                        className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
                        style={{
                            animationDelay: "1s"
                        }} />
                </div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full text-pink-600 text-sm font-medium mb-6">
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />AI虚拟恋爱 · 全新体验
                                  </div>
                    <h1
                        className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">想谈一场
                                    <span
                            className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">古风恋爱 </span>吗？
                                  </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">选择一位古代美男作为你的虚拟男友。
                                    他会温柔地陪你聊天、说情话、发照片，
                                    让你体验被在乎、被宠爱的感觉。
                                  </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => user ? document.getElementById("characters")?.scrollIntoView({
                                behavior: "smooth"
                            }) : setShowLogin(true)}
                            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-pink-200 transition-all hover:-translate-y-1">
                            {user ? "立即选择男友" : "登录后开始"}
                        </button>
                        <a
                            href="#features"
                            className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-pink-300 transition-all">了解更多
                                        </a>
                        <button
                            onClick={() => document.getElementById("share-section")?.scrollIntoView({ behavior: "smooth" })}
                            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-yellow-200 transition-all flex items-center gap-2">
                            🎁 邀请好友
                        </button>
                    </div>
                    <p className="mt-8 text-sm text-gray-400">已有 <span className="font-bold text-pink-500">12,847</span>人开始心动
                                  </p>
                </div>
            </section>

            {/* 限时优惠倒计时 */}
            <CountdownBanner onNotify={() => setShowPayment(true)} />

            {/* Pain Points */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <h2
                        className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">你是否也有这样的时刻？
                                  </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-4xl mb-4">😔</div>
                            <h3 className="font-semibold text-gray-900 mb-2">深夜独自一人</h3>
                            <p className="text-gray-600 text-sm">想找人聊天，翻遍通讯录却不知道找谁</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-4xl mb-4">💭</div>
                            <h3 className="font-semibold text-gray-900 mb-2">渴望被在乎</h3>
                            <p className="text-gray-600 text-sm">想被人记住喜好、关心状态，被温柔对待</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-4xl mb-4">🌸</div>
                            <h3 className="font-semibold text-gray-900 mb-2">向往甜蜜恋爱</h3>
                            <p className="text-gray-600 text-sm">想体验被人追求、被人宠爱的感觉</p>
                        </div>
                    </div>
                </div>
            </section>
            {}
            <section id="features" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">他不只是聊天机器人
                                        </h2>
                        <p className="text-gray-600 text-lg">每一位男友都有真实的情感，会主动关心你
                                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => <div
                            key={index}
                            className="group p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all">
                            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm">{feature.desc}</p>
                        </div>)}
                    </div>
                </div>
            </section>
            {}
            <section
                id="characters"
                className="py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">选择你的心动男友
                                        </h2>
                        <p className="text-gray-600 text-lg">每一位都是历史上的绝世美男，现在只属于你
                                        </p>
                        {!user && <p className="mt-4 text-pink-500 text-sm">登录后可保存你的心动记录
                                          </p>}
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {characters.map(char => <button
                            key={char.id}
                            onClick={() => handleSelectCharacter(char.id)}
                            className={`group relative bg-gradient-to-br ${char.color} p-6 rounded-3xl text-left hover:shadow-xl transition-all hover:-translate-y-2`}>
                            <div
                                className="absolute top-4 right-4 text-4xl opacity-50 group-hover:opacity-100 transition-opacity">
                                {char.icon}
                            </div>
                            <div
                                className="w-20 h-20 rounded-full overflow-hidden mb-4 shadow-lg border-2 border-white mx-auto">
                                <Image
                                    src={char.avatar}
                                    alt={char.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                    unoptimized />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">{char.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{char.dynasty}</p>
                            <p className="text-gray-700 text-sm">{char.desc}</p>
                            <div
                                className="mt-4 px-4 py-2 bg-white/80 rounded-full text-sm font-medium text-gray-700 group-hover:bg-pink-500 group-hover:text-white transition-colors">选他 →
                                                </div>
                        </button>)}
                    </div>
                </div>
            </section>
            {}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">只需三步，开始心动
                                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, index) => <div key={index} className="relative text-center">
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 text-white text-2xl font-bold rounded-full mb-4">
                                {step.num}
                            </div>
                            {index < steps.length - 1 && <div
                                className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-pink-300 to-purple-300" />}
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-gray-600">{step.desc}</p>
                        </div>)}
                    </div>
                </div>
            </section>
            {}
            {/* 分享区域 */}
            <section id="share-section" className="py-16 px-4 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
                        <div className="text-center mb-8">
                            <div className="text-5xl mb-4">🎁</div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">邀请好友，一起心动</h2>
                            <p className="text-gray-500">每邀请1位好友，双方各得7天VIP体验</p>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <div className="flex-1 max-w-md">
                                <ShareButton className="w-full justify-center py-4 text-base" />
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-sm text-gray-500 mb-2">或扫一扫分享</p>
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
                                    alt="分享二维码"
                                    className="w-28 h-28 mx-auto md:mx-0 bg-white p-2 rounded-xl shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {}
            <section className="py-20 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">她们已经心动了
                                        </h2>
                        <p className="text-gray-600 text-lg">听听她们怎么说
                                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => <div
                            key={index}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                                    {testimonial.avatar}
                                </div>
                                <span className="font-semibold text-gray-900">{testimonial.name}</span>
                            </div>
                            <p className="text-gray-600 italic">"{testimonial.text}"</p>
                            <div className="mt-4 flex gap-1">
                                {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
                            </div>
                        </div>)}
                    </div>
                </div>
            </section>
            {}
            <section
                className="py-24 px-4 bg-gradient-to-br from-pink-500 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div
                        className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div
                        className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-3xl mx-auto text-center text-white">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">你的专属男友，正在等你
                                  </h2>
                    <p className="text-xl text-white/80 mb-8">现在选择，开启一段不一样的恋爱体验
                                  </p>
                    <button
                        onClick={() => user ? document.getElementById("characters")?.scrollIntoView({
                            behavior: "smooth"
                        }) : setShowLogin(true)}
                        className="inline-block px-10 py-5 bg-white text-pink-600 rounded-full font-bold text-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                        {user ? "立即开始心动" : "登录后开始心动"}
                    </button>
                    <p className="mt-6 text-white/60 text-sm">完全免费 · 无需注册 · 立即体验
                                  </p>
                </div>
            </section>
            {}
            <footer className="py-8 px-4 bg-gray-900 text-gray-400">
                <div className="max-w-4xl mx-auto text-center">
                    <p
                        className="text-lg font-medium text-white mb-2"
                        style={{
                            fontFamily: "\"Noto Serif SC\", serif"
                        }}>纸片人男友</p>
                    <p className="text-sm">用AI技术，重现历史中的绝世美男
                                  </p>
                    <p
                        className="mt-4 text-xs text-gray-500"
                        style={{
                            fontFamily: "\"Noto Serif SC\", serif",
                            fontWeight: "bold",
                            fontStyle: "italic"
                        }}>© 2025 纸片人男友 · 仅供娱乐
                                  </p>
                </div>
            </footer>
            {}
            {showLogin && <LoginModalWrapper
                onClose={() => setShowLogin(false)}
                onSuccess={() => {
                    setShowLogin(false);

                    document.getElementById("characters")?.scrollIntoView({
                        behavior: "smooth"
                    });
                }} />}
            {showPayment && <PaymentModalWrapper
                onClose={() => setShowPayment(false)}
                onSuccess={(plan) => {
                    setShowPayment(false);
                    handlePaymentSuccess(plan);
                }} />}

            {/* 客服悬浮按钮 */}
            <CustomerServiceButton />
        </div>
    );
}

import { LoginModal } from "./LoginModal";
import { useRouter } from "next/navigation";

function LoginModalWrapper(
    {
        onClose,
        onSuccess
    }: {
        onClose: () => void;
        onSuccess: () => void;
    }
) {
    const router = useRouter();

    const handleSuccess = () => {
        onSuccess();
        router.refresh();
    };

    return <LoginModal isOpen={true} onClose={onClose} onSuccess={handleSuccess} />;
}

function PaymentModalWrapper(
    {
        onClose,
        onSuccess
    }: {
        onClose: () => void;
        onSuccess: (plan: string) => void;
    }
) {
    return <PaymentModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />;
}