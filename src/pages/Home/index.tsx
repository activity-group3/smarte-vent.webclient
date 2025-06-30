import React, { useRef, FC, MutableRefObject } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  Box,
  Avatar,
  useTheme,
  SxProps,
  Theme,
} from "@mui/material";
import {
  CalendarToday,
  People,
  CardMembership,
  BarChart,
  School,
  EmojiEvents,
  Stars,
} from "@mui/icons-material";
import type { Mesh } from "three";
import { Feature, Step, Testimonial } from '@/types/ui';

/* --------- Utils & Types --------- */

/* --------- Floating Sphere --------- */

const FloatingSphere: FC = () => {
  const meshRef: MutableRefObject<Mesh | null> = useRef<Mesh | null>(null);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (mesh) {
      const elapsed = clock.getElapsedTime();
      mesh.position.y = Math.sin(elapsed) * 0.6;
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.2} />
    </Sphere>
  );
};

/* --------- Main Page --------- */

const Home: FC = () => {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress }: { scrollYProgress: MotionValue<number> } =
    useScroll({
      container: scrollRef,
    });
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const glassSx: SxProps<Theme> = {
    backdropFilter: "blur(12px)",
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(0,0,0,0.7)"
        : "rgba(255,255,255,0.65)",
  };

  /* ----- Data ----- */

  const features: Feature[] = [
    {
      icon: <CalendarToday fontSize="large" />,
      title: "Activity Calendar",
      text: "Browse and join upcoming university events and activities",
    },
    {
      icon: <People fontSize="large" />,
      title: "Team Collaboration",
      text: "Connect with other students and form activity groups",
    },
    {
      icon: <CardMembership fontSize="large" />,
      title: "Achievement Tracking",
      text: "Monitor your participation and earn certificates",
    },
    {
      icon: <BarChart fontSize="large" />,
      title: "Progress Dashboard",
      text: "Visualize your activity participation and achievements",
    },
  ];

  const steps: Step[] = [
    {
      icon: <School fontSize="large" />,
      title: "Create Profile",
      text: "Sign up with your campus account in seconds.",
    },
    {
      icon: <EmojiEvents fontSize="large" />,
      title: "Join Activities",
      text: "Pick events you love and collaborate with peers.",
    },
    {
      icon: <Stars fontSize="large" />,
      title: "Earn Badges",
      text: "Track progress, gain certificates, and level-up your résumé.",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Mai Trần",
      role: "Computer Science 2025",
      avatar: "https://i.pravatar.cc/150?u=maitran",
      quote:
        "Hệ thống đã giúp mình tìm bạn cùng nhóm cho hackathon và quản lý chứng chỉ hoạt động cực kì tiện!",
    },
    {
      name: "Nguyễn Khôi",
      role: "Business Administration 2024",
      avatar: "https://i.pravatar.cc/150?u=khoinguyen",
      quote:
        "Dashboard trực quan, hỗ trợ mình show thành tích ngoại khoá khi ứng tuyển thực tập.",
    },
    {
      name: "Lê Anh",
      role: "Engineering 2026",
      avatar: "https://i.pravatar.cc/150?u=leanh",
      quote:
        "Tính năng nhóm và chat realtime thật sự làm teamwork dễ dàng hơn nhiều.",
    },
  ];

  return (
    /* ------------- Scrollable Container ------------- */
    <div ref={scrollRef} className="h-screen overflow-y-scroll scroll-smooth">
      <div className="flex flex-col min-h-[300vh]">
        {" "}
        {/* Make page ~3× viewport */}
        {/* ---- 3D Background ---- */}
        <div className="fixed inset-0 -z-10 opacity-20">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            <FloatingSphere />
            <OrbitControls enableZoom={false} autoRotate />
          </Canvas>
        </div>
        {/* ---- Navigation ---- */}
        <AppBar position="sticky" className="bg-gray-900/80 backdrop-blur-md">
          <Toolbar>
            <Typography variant="h6" component="div" className="flex-grow">
              Student Activity Management
            </Typography>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                color="inherit"
                component={Link}
                to="/auth/login"
                className="hover:bg-gray-700 transition-colors"
              >
                Login
              </Button>
            </motion.div>
          </Toolbar>
        </AppBar>
        {/* ---- HERO ---- */}
        <Container maxWidth="xl" className="py-24">
          <motion.div style={{ rotateY, scale }} className="perspective-1000">
            <Box
              className="space-y-6 p-10 md:p-16 rounded-2xl shadow-2xl text-center"
              sx={glassSx}
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  Manage Your University Activities
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Typography
                  variant="body1"
                  className="text-xl text-gray-700 dark:text-gray-300"
                >
                  Track, participate, and grow through university activities and
                  events
                </Typography>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
        {/* ---- FEATURES ---- */}
        <Container maxWidth="xl" className="pb-24">
          <Grid container spacing={4} className="px-4">
            {features.map((feature, idx) => (
              <Grid item xs={12} sm={6} lg={3} key={idx}>
                <motion.div
                  initial={{ opacity: 0, rotateX: 45 }}
                  whileInView={{ opacity: 1, rotateX: 0 }}
                  viewport={{ once: true, margin: "-100px 0px -100px 0px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card className="h-full p-6 transition transform hover:shadow-2xl hover:-translate-y-2 group perspective-1000">
                    <CardContent className="text-center space-y-4 preserve-3d">
                      <motion.div
                        whileHover={{ rotateY: 360, scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                        className="text-blue-600 mb-4"
                      >
                        {feature.icon}
                      </motion.div>
                      <Typography variant="h5" className="font-bold mb-2">
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {feature.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
        {/* ---- HOW IT WORKS ---- */}
        <section className="bg-gradient-to-b from-white/60 to-blue-50 dark:from-gray-900/60 dark:to-gray-900 py-24">
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              align="center"
              className="font-extrabold mb-12"
            >
              How It Works
            </Typography>
            <Grid container spacing={6}>
              {steps.map((step, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                    className="text-center p-8 rounded-xl shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-md"
                  >
                    <div className="text-blue-600 mb-4">{step.icon}</div>
                    <Typography variant="h6" className="font-bold mb-2">
                      {step.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-600 dark:text-gray-400"
                    >
                      {step.text}
                    </Typography>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </section>
        {/* ---- TESTIMONIALS ---- */}
        <section className="py-24">
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              align="center"
              className="font-extrabold mb-12"
            >
              What Students Say
            </Typography>
            <Grid container spacing={6}>
              {testimonials.map((t, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: idx * 0.1,
                      type: "spring",
                      stiffness: 80,
                    }}
                    className="text-center p-8 rounded-xl shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md"
                  >
                    <Avatar
                      src={t.avatar}
                      alt={t.name}
                      sx={{ width: 80, height: 80, margin: "0 auto 1rem" }}
                    />
                    <Typography variant="subtitle1" className="font-semibold">
                      {t.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="block mb-4 text-gray-500"
                    >
                      {t.role}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="italic text-gray-700 dark:text-gray-300"
                    >
                      “{t.quote}”
                    </Typography>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </section>
        {/* ---- CTA ---- */}
        <section
          className="py-20"
          style={{ background: "linear-gradient(90deg,#3b82f6,#8b5cf6)" }}
        >
          <Container maxWidth="md">
            <Box textAlign="center" className="space-y-8">
              <Typography
                variant="h2"
                className="text-3xl md:text-4xl font-bold text-white"
              >
                Ready to Get Started?
              </Typography>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  component={Link}
                  to="/auth/login"
                  size="large"
                  className="bg-white text-blue-600 py-3 px-8 rounded-lg shadow-lg transition-transform"
                >
                  Join Now
                </Button>
              </motion.div>
            </Box>
          </Container>
        </section>
        {/* ---- FOOTER ---- */}
        <footer className="bg-gray-900 text-white py-6 mt-auto">
          <Container maxWidth="xl">
            <Typography variant="body2" align="center">
              © 2025 Student Activity Management. All rights reserved.
            </Typography>
          </Container>
        </footer>
      </div>
    </div>
  );
};

export default Home;
