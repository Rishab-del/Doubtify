import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Offcanvas from "./Offcanvas/Offcanvas";

export default function Home() {
  return (
    <>
      <Offcanvas/>
      <Navbar />
      <Hero />
    </>
  );
}