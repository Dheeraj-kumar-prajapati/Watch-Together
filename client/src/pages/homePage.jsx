import React from "react";
import { Link } from 'react-router-dom';
import "/public/css/homePage.css";

function HomePage() {
    return (
        <div>
            <header id="header">
                <div className="container">
                    <img src="/public/images/logo2.png" alt="Logo" className="logo-img" />
                    <h1 className="logo-text"><a href="/">Watch Together</a></h1>
                </div>
            </header>

            <section id="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1>Let's have fun Virtually</h1>
                            <h2>Introducing a new era of Virtual Hang outs!</h2>
                            <Link to="/join" className="btn-get-started">Let's Go!</Link>
                        </div>
                        <div className="hero-img-container">
                            <img src="/public/images/logo2.png" className="hero-img" alt="Hero" />
                        </div>
                    </div>
                </div>
            </section>

            <section id="services">
                <div className="container">
                    <div className="section-title">
                        <h2>Our Services</h2>
                        <p>Create a room, share room ID with your friends and have fun!</p>
                    </div>
                    <div className="service-list">
                        <div className="icon-box">
                            <div className="icon">&#x1F4FA;</div>
                            <h4><a href="/">Watch A Video</a></h4>
                            <p>Watch Video content with all your friends synchronously. Every member can initiate any video, start, pause, and seek time synchronously.</p>
                        </div>
                        <div className="icon-box">
                            <div className="icon">&#x1F4AC;</div>
                            <h4><a href="/">Chat with Friends</a></h4>
                            <p>Add as many friends as you want to your Watch Together room and chat with all of them. Every member can send and read every message.</p>
                        </div>
                        {/* <div className="icon-box"> */}
                        {/* <div className="icon">&#x1F4F9;</div> */}
                        {/* <h4><a href="/">Video Call</a></h4> */}
                        {/* <p>Watch Together lets you have fun with your friends over a video call while watching together your favorite videos!</p> */}
                        {/* </div> */}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
