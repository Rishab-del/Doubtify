import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Offcanvas from "./Offcanvas/Offcanvas";
import BackButton from "./Offcanvas/BackButton";

export default function Home() {
  return (
    <>
      <BackButton/>
      <Offcanvas/>
      <Navbar />
      <Hero />
    </>
  );
}