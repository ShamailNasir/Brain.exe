'use client';

import React from "react";
import { motion } from "framer-motion";
import styles from "./GeometricBackground.module.css";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradientClass,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={`${styles.shapeContainer} ${className || ""}`}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className={styles.shapeRelative}
      >
        <div className={`${styles.shapeBlur} ${gradientClass || ""}`} />
      </motion.div>
    </motion.div>
  );
}

export default function GeometricBackground({ children, className }) {
  return (
    <div className={styles.container}>
      <div className={styles.bgGradientMain} />

      <div className={styles.shapesWrapper}>
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradientClass={styles.gradientIndigo}
          className={styles.shape1}
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradientClass={styles.gradientRose}
          className={styles.shape2}
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradientClass={styles.gradientViolet}
          className={styles.shape3}
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradientClass={styles.gradientAmber}
          className={styles.shape4}
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradientClass={styles.gradientCyan}
          className={styles.shape5}
        />
      </div>

      <div className={styles.overlay} />
      <div style={{ position: 'relative', zIndex: 1 }} className={className || ""}>
        {children}
      </div>
    </div>
  );
}
