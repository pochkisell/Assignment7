const ejs = require("ejs");
const fs = require("node:fs");
const http = require("node:http");
const url = require("node:url");

// set up web server
const server = http.createServer(listener);

// last known count
let count = 0;

// Map of file extensions to mime types
const mimeTypes = {
  ico: "image/x-icon",
  js: "text/javascript",
  css: "text/css",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

// Process requests based on pathname
async function listener(request, response) {
  const { pathname } = url.parse(request.url);

  if (pathname === "/") {
    await main(request, response);
  } else if (fs.existsSync(`public${pathname}`)) {
    try {
      const contents = fs.readFileSync(`public${pathname}`);
      const extension = pathname.split(".").pop().toLowerCase();
      const mimeType = mimeTypes[extension] || "application/octet-stream";

      response.writeHead(200, { "Content-Type": mimeType });
      response.write(contents, "utf-8");
    } catch (error) {
      response.writeHead(500, { "Content-Type": "text/plain" });
      response.write(error + "\n");
    }

    response.end();
  } else {
    response.writeHead(404);
    response.end("Not found.");
  }
}

// Main page
async function main(_request, response) {
  // increment counter in counter.txt file
  try {
    count = parseInt(fs.readFileSync("counter.txt", "utf-8")) + 1;
  } catch {
    count = 1;
  }

  fs.writeFileSync("counter.txt", count.toString());

  // render HTML response
  try {
    let contents = fs.readFileSync("views/index.ejs", "utf-8");
    const evidence = [
      {
        number: "01",
        title: "Screenshot 1 · initial tofu plan",
        description: "The initial plan showing what OpenTofu intends to create.",
        filenames: ["1.png"],
        alt: "Screenshot of the initial OpenTofu plan",
      },
      {
        number: "02",
        title: "Screenshot 2 · apply and outputs",
        description: "Successful apply, created resources and printed URL.",
        filenames: ["21.png", "22.png", "23.png"],
        alt: "Screenshot of the initial successful OpenTofu apply and outputs",
      },
      {
        number: "03",
        title: "Screenshot 3 · browser at the floating IP",
        description: "The custom web page opened in a browser.",
        filenames: ["3.png"],
        alt: "Screenshot of the deployed custom page in a browser",
      },
      {
        number: "04",
        title: "Screenshot 4 · cPouta resources",
        description: "The created instance and security group in the web interface.",
        filenames: ["4.png"],
        alt: "Screenshot of the cPouta instance and security group",
      },
      {
        number: "05",
        title: "Screenshot 5 · plans for both change options",
        description: "Plan evidence for the two selected changes.",
        filenames: ["5.png"],
        alt: "Screenshot of the change option plans",
      },
      {
        number: "06",
        title: "Screenshot 6 · results of both change options",
        description: "Result evidence for the two selected changes.",
        filenames: ["5.png"],
        alt: "Screenshot of the change option results",
      },
      {
        number: "07",
        title: "Screenshot 7 · drift plans",
        description: "Plans for drift parts 1 and 2.",
        filenames: ["71.png", "72.png", "73.png"],
        alt: "Screenshot of an OpenTofu drift plan",
      },
      {
        number: "08",
        title: "Screenshot 8 · destroy output",
        description: "Resources removed and the destroy order.",
        filenames: ["8.png"],
        alt: "Screenshot of the OpenTofu destroy output",
      },
      {
        number: "09",
        title: "Screenshot 9 · apply and browser after rebuild",
        description: "Evidence for the second apply and restored page.",
        filenames: ["9.png"],
        alt: "Screenshot supplied as evidence for the rebuild",
      },
    ].map((item) => ({
      ...item,
      images: item.filenames.map((filename) => {
        const match = /^(\d+)\.(png|jpe?g|webp)$/i.exec(filename);
        const diskFilename = match
          ? `${match[1]}.${match[2].toLowerCase()}`
          : filename;

        return {
          filename,
          src: `/evidence/${encodeURIComponent(filename)}`,
          exists: fs.existsSync(`public/evidence/${diskFilename}`),
          alt: `${item.alt} (${filename})`,
        };
      }),
      exists: item.filenames.every((filename) =>
        fs.existsSync(
          `public/evidence/${filename.replace(/\.(jpe?g|webp)$/i, (extension) => extension.toLowerCase())}`,
        ),
      ),
    }));
    const evidenceByFilename = new Map(
      evidence.flatMap((item) =>
        item.images.map((image) => [image.filename, image.exists]),
      ),
    );
    const submissionChecks = [
      {
        title: "Repository files",
        description:
          "The Terraform files, cloud-init.yaml, .gitignore, .terraform.lock.hcl, terraform.tfvars.example and README.md are present. Confirm the lock file is committed.",
        manual: true,
      },
      {
        title: "No secrets committed",
        description:
          "Check git status and GitHub: no clouds.yaml, terraform.tfvars, state files or private SSH keys.",
        manual: true,
      },
      {
        title: "Screenshots are safe to publish",
        description:
          "Review each image for application-credential secrets, cloud config, private keys and personal variable values.",
        manual: true,
      },
      {
        title: "Every experiment is documented",
        description:
          "For each experiment, include your prediction, actual result and explanation; do not leave pending-result notes.",
        manual: true,
      },
      {
        title: "Assignment documentation is complete",
        description:
          "Include the repository link, resource/file explanation, working apply and page evidence, experiments, reflection and problems solved.",
        manual: true,
      },
      {
        title: "Screenshot 1 · first plan",
        description: "Shows what OpenTofu would create.",
        files: ["1.png"],
      },
      {
        title: "Screenshot 2 · first apply and outputs",
        description: "Shows created resources and the URL output.",
        files: ["21.png", "22.png", "23.png"],
      },
      {
        title: "Screenshot 3 · browser page",
        description: "Shows the page at the floating IP.",
        files: ["3.png"],
      },
      {
        title: "Screenshot 4 · cPouta resources",
        description: "Shows the instance and security group in the web UI.",
        files: ["4.png"],
      },
      {
        title: "Screenshot 5 · both change plans",
        description: "Shows the plan for Option A and the plan for Option B.",
        files: ["5.png"],
      },
      {
        title: "Screenshot 6 · change results",
        description: "Shows the changed page and the HTTPS browser result.",
        files: ["5.png"],
      },
      {
        title: "Screenshot 7 · drift parts 1 and 2",
        description: "Shows the plans for both drift scenarios.",
        files: ["71.png", "72.png", "73.png"],
      },
      {
        title: "Screenshot 8 · destroy",
        description: "Shows the resources being removed.",
        files: ["8.png"],
      },
      {
        title: "Screenshot 9 · rebuild",
        description: "Shows the second apply and the restored browser page.",
        files: ["9.png"],
      },
    ].map((item) => ({
      ...item,
      complete: item.files
        ? item.files.every((filename) => evidenceByFilename.get(filename))
        : false,
    }));

    contents = ejs.render(contents, { count, evidence, submissionChecks });

    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(contents, "utf-8");
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.write(error + "\n");
  }

  response.end();
}

// Start web server on port 3000
server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
