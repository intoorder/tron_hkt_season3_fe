import { useState, useEffect } from "react";
import { Button } from "../components/Button";
import axios from "axios";
import { apiConfig } from "../config";
import { authUtils } from "../utils";

const GAME_SNAPSHOT_DURATION = 6000;
const DROP_DURATION = 3000;
let zenMusic = new Audio("music/zen-music.mp3");

export const Zen = ({ duration, setBalance }) => {
  const [repeatTime, setRepeatTime] = useState(duration);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [isGameActive, setGameActive] = useState(true);
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    zenMusic.play();
  }, []);

  useEffect(() => {
    if (repeatTime <= 0) {
      zenMusic.pause();
      setGameActive(false);
      return;
    }

    if (Math.random() < 0.7) {
      // Start the animation and sound
      setDisplay(true);
      setTimeout(() => {
        const drip = new Audio("sounds/drip.mp3");
        drip.play();
      }, DROP_DURATION);
      setTimeout(() => {
        setRepeatTime(repeatTime - 1);
        setDisplay(false);
      }, DROP_DURATION * 2);
    } else {
      setTimeout(() => {
        setSnapshotCount(snapshotCount + 1);
      }, GAME_SNAPSHOT_DURATION);
    }
  }, [repeatTime, snapshotCount]);

  const DropAnimation = () =>
    display ? (
      <>
        <div className="zen-play">
          <div className={`drop`}></div>
          <div className={`wave`}></div>
        </div>
      </>
    ) : (
      ""
    );

  return (
    <div className="zen">
      <h1 className="text-xl text-center fade-in">
        Relax and count the number of drops. You can close your eyes...
      </h1>
      {isGameActive ? (
        <DropAnimation />
      ) : (
        <div className="zen-end">
          <h1 className="text-2xl text-center fade-in">
            How many drops did you hear?
          </h1>
          <GuessPanel setBalance={setBalance} />
        </div>
      )}
    </div>
  );
};

const GuessPanel = ({ setBalance }) => {
  const [result, setResult] = useState(null);
  const [chosenNumber, setChosenNumber] = useState(null);
  const guess = async (num) => {
    setChosenNumber(num);
    const { data } = await axios.post(
      `${apiConfig.IO_BACKEND_API}/meditation/guess`,
      {
        guess: num,
      },
      authUtils.getHeader()
    );
    if ([0, 1].includes(data?.data?.is_correct ?? 0)) {
      setResult(data.data.is_correct);
      setBalance(data.data.token_total);
    }
  };
  return (
    <div>
      <div className="flex justify-center mt-8">
        {new Array(8).fill().map((_, i) => (
          <div key={i} className="mr-2">
            <Button
              onClick={() => chosenNumber === null && guess(i + 1)}
              disabled={chosenNumber !== null && i + 1 !== chosenNumber}
            >
              {i + 1}
            </Button>
          </div>
        ))}
      </div>
      {result === 0 && (
        <div className="mt-8 text-center text-xl">
          Hm.. not really. Refresh to try again.
        </div>
      )}
      {result === 1 && (
        <div className="mt-8 text-center text-xl">
          Correct! You earned $100 NBT!
        </div>
      )}
    </div>
  );
};
