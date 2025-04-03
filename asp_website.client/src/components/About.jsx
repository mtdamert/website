function About() {
    return (
        <div className="items-center px-3 py-1.5 border">
            <div className="text-3xl">
                Michael Damert
            </div>
            <div className="py-2">
                Hi, I'm Mike. A full-stack developer.
            </div>
            <div className="py-2">
                Welcome to my personal web site of tests & games.
                The back end, used to save high scores in games, is written in <span className="font-bold">C#</span> and <span className="font-bold">ASP.NET MVC 8</span>.
            </div>
            <div className="py-2">
                The front end is <span className="font-bold">HTML 5</span>, <span className="font-bold">JavaScript</span>, <span className="font-bold">TypeScript</span>, <span className="font-bold">Vite</span>, and <span className="font-bold">ReactJS</span>.
            </div>
        </div>
    );
}

export default About;
