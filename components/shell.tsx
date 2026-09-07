import { ThemeToggle } from "./theme-toggle";

export function Shell({children,title="Workspace"}:{children:React.ReactNode,title?:string}) {
  return (
    <div className="shell plain-shell">
      <aside className="sidebar">
        <a href="/">
          <div className="brand">
            <div className="logo flex items-center justify-center">
              <img className="h-5 w-5 object-contain object-left" src="/logo.png" alt="Sociable Beet" />
            </div>
            <span>Sociable Beet</span>
          </div>
        </a>
        <nav className="nav">
          <a className={title==="Workspace"?"active":""} href="/">Workspace</a>
          <a className={title==="Projects"?"active":""} href="/projects">Projects</a>
          <a className={title==="Tasks"?"active":""} href="/tasks">Tasks</a>
          <a className={title==="Social Studio"?"active":""} href="/social">Social Studio</a>
          <a href="#">Files</a><a href="#">Activity</a><a href="#">Analytics</a><a href="#">Team</a><a href="#">Settings</a>
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <strong>{title}</strong>
          <div className="actions"><ThemeToggle /><button className="btn">Invite</button><button className="btn primary">New Project</button></div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
