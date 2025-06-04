import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  useTheme
} from '@mui/material';
import {
  CalendarToday,
  People,
  CardMembership,
  BarChart
} from '@mui/icons-material';

const FloatingSphere = () => {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    meshRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.5;
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.01;
  });
  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.2} />
    </Sphere>
  );
};

const Home = () => {
  const scrollRef = useRef();
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  const features = [
    { icon: <CalendarToday fontSize="large" />, title: 'Activity Calendar', 
      text: 'Browse and join upcoming university events and activities' },
    { icon: <People fontSize="large" />, title: 'Team Collaboration', 
      text: 'Connect with other students and form activity groups' },
    { icon: <CardMembership fontSize="large" />, title: 'Achievement Tracking', 
      text: 'Monitor your participation and earn certificates' },
    { icon: <BarChart fontSize="large" />, title: 'Progress Dashboard', 
      text: 'Visualize your activity participation and achievements' },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" ref={scrollRef}>
      {/* Animated 3D Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-20">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <FloatingSphere />
          <OrbitControls enableZoom={false} autoRotate />
        </Canvas>
      </div>

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
              className="hover:bg-gray-700"
            >
              Login
            </Button>
          </motion.div>
        </Toolbar>
      </AppBar>

      <main className="flex-grow">
        <Container maxWidth="xl" className="py-16 relative">
          {/* Parallax Hero Section */}
          <motion.div 
            style={{ rotateY, scale }}
            className="perspective-1000"
          >
            <Box textAlign="center" mb={8} className="space-y-6 bg-white/90 p-8 rounded-2xl shadow-2xl backdrop-blur-lg">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h1" className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Manage Your University Activities
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Typography variant="body1" className="text-xl text-gray-600">
                  Track, participate, and grow through university activities and events
                </Typography>
              </motion.div>
            </Box>
          </motion.div>

          {/* 3D Feature Cards */}
          <Grid container spacing={4} className="px-4">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, rotateX: 45 }}
                  whileInView={{ opacity: 1, rotateX: 0 }}
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full p-6 transition-all duration-300 transform hover:shadow-2xl hover:-translate-y-2 group perspective-1000">
                    <CardContent className="text-center space-y-4 preserve-3d">
                      <motion.div 
                        className="text-blue-600 mb-4"
                        whileHover={{ rotateY: 360, scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <Typography variant="h5" className="font-bold mb-2">
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        {feature.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Scroll-triggered 3D CTA */}
          <motion.div 
            className="py-12 mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <Box textAlign="center">
              <Typography variant="h2" className="text-3xl font-bold mb-4 text-white">
                Ready to Get Started?
              </Typography>
              <motion.div
                whileHover={{ scale: 1.05, rotateZ: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  component={Link}
                  to="/auth/login"
                  className="bg-white text-blue-600 py-3 px-8 rounded-lg shadow-lg"
                  size="large"
                >
                  Join Now
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </main>

      {/* Animated Footer */}
      <motion.footer 
        className="bg-gray-900 text-white py-6 mt-8"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" align="center">
            © 2024 Student Activity Management. All rights reserved.
          </Typography>
        </Container>
      </motion.footer>
    </div>
  );
};

export default Home;
