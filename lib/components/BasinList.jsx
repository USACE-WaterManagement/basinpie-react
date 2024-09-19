import { UsaceBox } from "@usace/groundwork";

export default function BasinPieList({basins}) {
  return (
    <div>
      <UsaceBox title="Basin Pages">
        <ul className="list-disc pl-5 ms-5">
            {basins.map((basin) => {
              return (
                <li key={basin?.title}>
                  <a className="underline" href={basin?.href}>
                    {basin?.title}
                  </a>
                </li>
              );
            })}
        </ul>
      </UsaceBox>
    </div>
  );
}
