const routes = {

	"/": {

		view: "index.ejs"

	},

	"/expo/*": {

		view: "expo.ejs"

	}

}

const cache = {};
const expos = [];
async function render (view, data) {

	const viewBody = cache[view] || await (await fetch(view.startsWith("../") ? view.replace("../", "") : `/views/${view}`)).text();
	cache[view] = viewBody;

	return ejs.render(viewBody, {
	
		expos,
		render,
		...data
		
	}, {

		async: true

	});

}

function _route () {

	return location.hash.replace("#", "") ? (location.hash.replace("#", "").endsWith("/") && location.hash.replace("#", "").length > 3 ? location.hash.replace("#", "").slice(0, -1) : location.hash.replace("#", "")) : "/";

}

function route () {

	// Checks if `_route` is equal to any routes
	// Also checks if a route ends with * and that the route it is compared too matches the beginning of the route (eg. /post/* and /post/potatoes_are_tasty)
	for (const route of Object.keys(routes)) if (route === _route() || (route.endsWith("*") && _route().startsWith(route.slice(0, route.length - 1)))) return routes[route];

}

async function load () {

	if (route()) {

		try {

			document.querySelector("main").innerHTML = await render(route().view);
			// feather.replace();

		} catch (e) {

			document.querySelector("main").innerHTML = await render("404.ejs");
			throw e;

		}

	} else {

		// location.hash = "#/404";

		document.querySelector("main").innerHTML = await render("404.ejs");

		console.log("Invalid page.");

	}

	for (const script of document.querySelector("main").querySelectorAll("script")) {

		const s = document.createElement("script");

		if (script.src) s.src = script.src;
		s.innerHTML = script.innerHTML;

		script.parentElement.appendChild(s);
		if (script.getAttribute("data-blocking") === "true") await new Promise(_ => s.addEventListener("load", () => _()));
		script.remove();

	}

}

async function main () {

	expos.push(...await (await fetch("expos.json")).json());
	await load();
	
	document.querySelector(".loading_screen").classList.add("hidden");
	setTimeout(() => {

		document.querySelector(".loading_screen").remove();

	}, 200);

	window.onpopstate = load;
	window.addEventListener("hashchange", async () => {
		
		await load();
		window.scrollTo(0, 0);
		
	});

}

main();
