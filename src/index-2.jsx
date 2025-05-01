import { useRef, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { createStore } from "redux";

function counterReducer(state = { counter: 1 }, action) {
	switch (action.type) {
		case "counter/increment":
			return { ...state, counter: state.counter + 1 };
		default:
			return state;
	}
}

const store = createStore(counterReducer);

function getCounter(state) {
	return state.counter;
}

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

	const counter = useSelector(getCounter);

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
	const dispatch = useDispatch();

	function onToggle() {
		console.log(show ? "--hide--" : "--show--");
		setShow(!show);
	}

	function onDispatch() {
		console.log("--dispatch--");
		dispatch({ type: "counter/increment" });
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
createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<App />
	</Provider>,
);
