import { basinMap } from "../config";
export default function basinList(basin) {
  const projects = basinMap[basin];
  return (
    <ul className="list-disc pl-5 ms-5">
      <p>
        {projects.map((project) => {
          return (
            <li key={project?.name} className="underline">
              <a href={project?.href}>{project?.name}</a>
            </li>
          );
        })}
      </p>
    </ul>
  );
}
