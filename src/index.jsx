import { useRef, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";

let GLOBAL_DISPATCH_COUNTER = 1;

function shouldChildRender(counter) {
	return counter % 3 !== 0;
}

function useCounter(component) {
	const ref = useRef(component);

	useEffect(() => {
		console.log(`${ref.current} effect mount`);
		return () => {
			console.log(`${ref.current} effect unmout`);
		};
	}, []);

	useEffect(() => {
		console.log(`${ref.current} effect setup`);
		return () => {
			console.log(`${ref.current} effect teardown`);
		};
	});

	const counter = useSyncExternalStore(
		useCallback((onChange) => {
			console.log(`${ref.current} subscribe`);
			function onDispatch() {
				console.log(`${ref.current} onDispatch`);
				onChange();
			}
			addEventListener(`dispatch`, onDispatch);
			return () => {
				console.log(`${ref.current} unsubscribe`);
				removeEventListener(`dispatch`, onDispatch);
			};
		}, []),
		useCallback(() => {
			const counter = GLOBAL_DISPATCH_COUNTER;
			console.log(`${ref.current} getSnapshot (counter: ${counter})`);
			return counter;
		}, []),
	);

	console.log(`${ref.current} render (counter: ${counter})`);

	return counter;
}

function Parent() {
	const counter = useCounter("parent");
	return (
		<>
			<div>parent: {counter}</div>
			{shouldChildRender(counter) && <Child />}
		</>
	);
}

function Child() {
	const counter = useCounter("child");
	if (!shouldChildRender(counter)) {
		throw new Error(`Child should not render with count ${counter}`);
	}
	return <div>child: {counter}</div>;
}

function App() {
	const [show, setShow] = useState(true);

	function onToggle() {
		console.log(show ? "--hide--" : "--show--");
		setShow(!show);
	}

	function onDispatch() {
		const counter = ++GLOBAL_DISPATCH_COUNTER;

		console.log(
			`--dispatch (counter: ${counter}, shouldChildRender: ${shouldChildRender(counter)})--`,
		);
		dispatchEvent(new Event("dispatch", { detail: counter }));
	}

	return (
		<>
			<button onClick={onToggle}>{show ? "Hide" : "Show"}</button>
			<button onClick={onDispatch}>Dispatch</button>
			{show && <Parent />}
		</>
	);
}

console.log("--initial render--");
createRoot(document.getElementById("root")).render(<App />);
