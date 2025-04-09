function About() {
    return (
        <div className="items-center px-3 pb-1.5 border">
            <div className="pl-12 text-4xl">
                Michael Damert
            </div>
            <div className="pl-16 pb-12 text-xl">
                full-stack developer
            </div>
            <div className="italic">
                The back end of this site is written in <span className="font-bold">C#</span> and <span className="font-bold">ASP.NET MVC 8</span>
            </div>
            <div className="italic">
                The front end uses <span className="font-bold">HTML 5</span>, <span className="font-bold">JavaScript</span>, <span className="font-bold">TypeScript</span>, <span className="font-bold">Vite</span>, and <span className="font-bold">ReactJS</span>
            </div>
        </div>
    );
}

export default About;
