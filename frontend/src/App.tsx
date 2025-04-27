import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

type Downloads = {
  windows: {
    machine_name: string;
    builds: { filename: string }[];
    file_size: number;
  };
}

type Item = {
  "human-name": string;
  "marketing-blurb": string;
  popularity: number;
  image: string;
  downloads: Downloads;
}

function extractContent(s: string): string {
  const span = document.createElement("span");
  span.innerHTML = s;
  return span.textContent || span.innerText;
}

function humanReadable(bytes: number): string {
  if (bytes < 1000) {
    return bytes.toString() + "B";
  } else if (bytes >= 1_000 && bytes < 1_000_000) {
    return (bytes / 1000).toFixed(1) + "kB";
  } else if (bytes >= 1_000_000 && bytes < 1_000_000_000) {
    return (bytes / 1_000_000).toFixed(1) + "MB";
  } else if (bytes >= 1_000_000_000 && bytes < 10_000_000_000) {
    return (bytes / 1_000_000_000).toFixed(1) + "GB";
  } else {
    return "Way too big!!";
  }
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/')
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {items.map((item, index) => (
        <Card key={index} className="shadow-lg">
          <CardHeader>
            <CardTitle>{item["human-name"]}</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={item.image} alt="" />
            <p>{extractContent(item["marketing-blurb"])}</p>
          </CardContent>
          <CardFooter>
            <a href={`http://localhost:5000/download?machine_name=${item.downloads.windows.machine_name}&filename=${item.downloads.windows.builds?.[0].filename}`} className={buttonVariants({ variant: "default" })} target='_blank' download>Download ({humanReadable(item.downloads.windows.file_size)})</a>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default App;
