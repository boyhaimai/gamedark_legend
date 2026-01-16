import { Objects, Objects_red, Rotation, bgWheel, knife1 } from "@/assets";
import dart from "@/assets/audio/dart.mp3";
import { useUserInfo } from "@/hooks/useUserInfo";
import { SocketEvent, socketIo } from "@/service/socket/SocketListener";
import { gameAtom } from "@/store/game.store";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import "../../styles/Game.css";
import ModalGame from "./Modal/ModalGame";

type KnifeType = {
  x: number;
  y: number;
  width: number;
  height: number;
  r: number;
  angle: number;
  cangle: number;
};

type ArcType = {
  centerX: number;
  centerY: number;
  radius: number;
  currentAngle: number;
  direction?: boolean;
  lineWidth?: number;
};

type RecType = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function getScoreFromAngle(angle: number): number {
  const scores = [
    "20",
    "5",
    "x",
    "1",
    "18",
    "4",
    "13",
    "6",
    "x",
    "15",
    "2",
    "17",
    "3",
    "16",
    "x",
    "20",
    "16",
    "8",
    "11",
    "14",
    "x",
    "12",
    "8",
    "1",
  ];
  const offsetAngle =
    (angle + Math.PI / 2 + (Math.PI / 180) * 4.0) % (2 * Math.PI); // căn chỉnh góc phi tiêu khi ghim vào bàn quay sao cho đạt điểm chuẩn nhất
  let zone = Math.floor((offsetAngle * 180) / Math.PI / 15) % 24;
  if (zone < 0) zone += 24;

  return scores[zone].toLowerCase() === "x" ? 0 : parseInt(scores[zone]);
}

interface GameProps {
  onScoreChange?: (score: number) => void;
  onOpponentScoreChange?: (score: number) => void;
}

const Game = ({ onScoreChange, onOpponentScoreChange }: GameProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const knifeImageRef = useRef<HTMLImageElement | null>(null);
  const rotationImageRef = useRef<HTMLImageElement | null>(null);
  const blackRotaImageRef = useRef<HTMLImageElement | null>(null);
  const neonImageRef = useRef<HTMLImageElement | null>(null);
  const hitSoundRef = useRef<HTMLAudioElement | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [knivesRemaining, setKnivesRemaining] = useState(5);
  const [canThrow, setCanThrow] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isRotating] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;
  const [rounding, setRounding] = useState(isMobile ? 150 : 170);
  const MAX_THROWS = 5;
  const [scoresList, setScoresList] = useState<(number | null)[]>(
    Array(MAX_THROWS).fill(null)
  );
  const [scoresListOrther, setScoresListOrther] = useState<(number | null)[]>(
    Array(MAX_THROWS).fill(null)
  );
  const { onGetMe } = useUserInfo();
  const [game] = useAtom(gameAtom);
  const setGame = useSetAtom(gameAtom);

  const { user } = useUserInfo();
  const [floatingScore, setFloatingScore] = useState<{
    value: number;
    id: number;
  } | null>(null);

  useEffect(() => {
    const handleAttack = (data: any) => {
      const myId = user?._id;
      const { user_1, user_2 } = data.detail;
      const isUser1 = user_1._id === myId;
      const opponent = isUser1 ? user_2 : user_1;
      const countTurn = isUser1
        ? data.count_turn_user_2
        : data.count_turn_user_1;
      const opponentScores = [1, 2, 3, 4, 5].map((turn) =>
        turn <= countTurn ? opponent[`turn_${turn}`] : null
      );
      setScoresListOrther(opponentScores);
    };
    socketIo.on(SocketEvent.ATTACK, handleAttack);
    return () => {
      socketIo.off(SocketEvent.ATTACK, handleAttack);
    };
  }, [user]);

  useEffect(() => {
    const total = scoresList.reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
    if (onScoreChange && total !== null) {
      onScoreChange(total);
    }
  }, [scoresList, onScoreChange]);

  useEffect(() => {
    const total = scoresListOrther.reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
    if (onOpponentScoreChange && total !== null) {
      onOpponentScoreChange(total);
    }
  }, [scoresListOrther, onOpponentScoreChange]);

  useEffect(() => {
    const handleEndGame = (data: any) => {
      setIsGameOver(true);
      setIsModalOpen(true);
      setGame(data);
      socketIo.disconnect();
      onGetMe();
    };
    socketIo.on(SocketEvent.END_GAME, handleEndGame);
    return () => {
      socketIo.off(SocketEvent.END_GAME, handleEndGame);
    };
  }, [socketIo, game, setGame, onGetMe]);

  const gameStateRef = useRef<{
    isKnifeMoving: boolean;
    hitKnives: KnifeType[];
    currentAngle: number;
    knifeY: number;
    hit: number;
    flag: number;
  }>({
    isKnifeMoving: false,
    hitKnives: [],
    currentAngle: 0,
    knifeY: 0,
    hit: 0,
    flag: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [direction, setDirection] = useState<1 | -1>(1);

  // Tạo asset chỉ một lần khi mount
  useEffect(() => {
    let loaded = 0;
    const checkAllLoaded = () => {
      loaded++;
      if (loaded === 4) setAssetsLoaded(true);
    };
    const knifeImg = new window.Image();
    knifeImg.src = knife1;
    knifeImg.onload = checkAllLoaded;
    knifeImageRef.current = knifeImg;

    const rotationImg = new window.Image();
    rotationImg.src = Rotation;
    rotationImg.onload = checkAllLoaded;
    rotationImageRef.current = rotationImg;

    const blackRotaImg = new window.Image();
    blackRotaImg.src = Rotation;
    blackRotaImg.onload = checkAllLoaded;
    blackRotaImageRef.current = blackRotaImg;

    const neonImg = new window.Image();
    neonImg.src = bgWheel;
    neonImg.onload = checkAllLoaded;
    neonImageRef.current = neonImg;

    const audio = new window.Audio(dart);
    audio.preload = "auto";
    hitSoundRef.current = audio;
  }, []);

  useEffect(() => {
    if (!assetsLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;
    let isMounted = true;

    const knifeImage = knifeImageRef.current!;
    const rotationImage = rotationImageRef.current!;
    const blackRotaImage = blackRotaImageRef.current!;

    const checkCollision = (curArc: ArcType, curRec: RecType) => {
      const rotationRadius = rotationImage.width
        ? rotationImage.width / 2
        : 100;
      if (curRec.y - curArc.centerY <= rotationRadius) {
        if (hitSoundRef.current) {
          hitSoundRef.current.currentTime = 0;
          hitSoundRef.current.play();
        }
        gameStateRef.current.hit = 1;

        const knifeCenterX = curRec.x + curRec.width / 2;
        const knifeCenterY = curRec.y + curRec.height / 2;
        const dx = knifeCenterX - curArc.centerX;
        const dy = knifeCenterY - curArc.centerY;
        let absoluteHitAngle = Math.atan2(dy, dx);
        absoluteHitAngle = (absoluteHitAngle + 2 * Math.PI) % (2 * Math.PI);

        let relativeHitAngle = absoluteHitAngle - curArc.currentAngle;
        relativeHitAngle = (relativeHitAngle + 2 * Math.PI) % (2 * Math.PI);

        // Lấy điểm chơi
        const scoreValue = getScoreFromAngle(relativeHitAngle);

        gameStateRef.current.hitKnives.push({
          x: curRec.x,
          y: curRec.y,
          width: curRec.width,
          height: curRec.height,
          r: rotationRadius,
          angle: 0,
          cangle: absoluteHitAngle,
        });
        setKnivesRemaining((prev) => prev - 1);
        setScoresList((prev) => {
          const next = [...prev];
          const idx = next.findIndex((v) => v === null);
          if (idx !== -1) {
            next[idx] = scoreValue;
            // Show floating score animation
            setFloatingScore({ value: scoreValue, id: Date.now() });
            setTimeout(() => setFloatingScore(null), 1500);

            if (game && user) {
              socketIo.emit(SocketEvent.ATTACK, {
                game_id: game._id,
                user_id: user._id,
                point: scoreValue,
                turn: idx + 1,
              });
            }
          }
          return next;
        });
        setRounding((prev) => Math.max(prev - 20, 30));
        setDirection((prev) => (prev === 1 ? -1 : 1)); // Đảo chiều quay
        return true;
      }
      return false;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Vẽ nền neon dưới vòng quay
      const neonImage = neonImageRef.current;
      if (neonImage) {
        const neonSize = Math.min(canvas.width, 400); // 80% chiều rộng canvas, tối đa 400px
        const neonX = canvas.width / 2 - neonSize / 1.3;
        const neonY = 230 - neonSize / 1.3; // Căn giữa với vòng quay

        // Vẽ neon
        ctx.save();
        ctx.drawImage(
          neonImage,
          neonX,
          neonY,
          blackRotaImage.width * 1.8,
          blackRotaImage.height * 1.8
        );
        ctx.restore();
      }

      if (!isGameOver) {
        ctx.beginPath();
        ctx.drawImage(
          knifeImage,
          canvas.width / 2 - 12.5,
          gameStateRef.current.knifeY,
          40,
          120
        );
      }
      if (gameStateRef.current.hitKnives.length > 0) {
        gameStateRef.current.hitKnives.forEach((knife) => {
          ctx.save();
          ctx.translate(canvas.width / 2, 230); //vị trí của phi tiêu di chuyển lên xuống khi đã ghim vào bàn quay
          ctx.beginPath();
          ctx.rotate(knife.angle);
          ctx.drawImage(
            knifeImage,
            knife.x - canvas.width / 2,
            knife.y - 250, //khoảng cách các phi tiêu đi qua tâm vòng tròn
            40, //kích thước của phi tiêu
            120
          );
          ctx.closePath();
          ctx.translate(-canvas.width / 2, -240);
          ctx.restore();
        });
      }
      ctx.save();
      ctx.translate(canvas.width / 2, 230); //vị trí của bàn quay di chuyển lên xuống
      ctx.rotate(gameStateRef.current.currentAngle);
      ctx.drawImage(
        rotationImage,
        -blackRotaImage.width / 2,
        -blackRotaImage.height / 2,
        blackRotaImage.width,
        blackRotaImage.height
      );
      ctx.restore();
    };

    const update = () => {
      if (!isMounted) {
        return;
      }

      if (!isGameOver) {
        gameStateRef.current.hitKnives.forEach((knife) => {
          knife.angle =
            (knife.angle + (direction * Math.PI) / rounding) % (2 * Math.PI);
        });

        gameStateRef.current.currentAngle =
          (gameStateRef.current.currentAngle +
            (direction * Math.PI) / rounding) %
          (2 * Math.PI);
      }

      if (isGameOver) {
        return;
      }

      if (knivesRemaining > 0) {
        if (gameStateRef.current.knifeY < 0 || gameStateRef.current.hit === 1) {
          const canvas = canvasRef.current;
          if (canvas) {
            gameStateRef.current.knifeY = canvas.height - 145;
          }
          gameStateRef.current.isKnifeMoving = false;
          gameStateRef.current.hit = 0;
          setCanThrow(true);
        }

        const currentArc = {
          centerX: canvas.width / 2,
          centerY: 200,
          radius: rotationImage.width ? rotationImage.width / 2 : 100,
          currentAngle: gameStateRef.current.currentAngle,
          direction: false,
          lineWidth: 33,
        };

        const currentRec = {
          x: canvas.width / 2,
          y: gameStateRef.current.knifeY,
          width: 25,
          height: 85,
        };

        if (gameStateRef.current.isKnifeMoving) {
          gameStateRef.current.knifeY -= 15;
        }

        if (isRotating) {
          gameStateRef.current.currentAngle =
            (gameStateRef.current.currentAngle + Math.PI / rounding) %
            (2 * Math.PI);
        }

        checkCollision(currentArc, currentRec);
      } else {
        setIsGameOver(true);
        // setIsModalOpen(true);
      }
    };

    const gameLoop = () => {
      update();
      draw();
      if (isMounted) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    canvas.width = 500;
    // Chỉ cộng 100px khi màn hình dưới 400px
    canvas.height =
      window.innerWidth < 400 ? window.innerHeight + 100 : window.innerHeight;
    gameStateRef.current.knifeY = canvas.height - 145; //vị trí của phi tiêu khi chưa ghim vào bàn quay

    gameLoop();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [knivesRemaining, isGameOver, assetsLoaded]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Chỉ cộng 100px khi màn hình dưới 400px
      canvas.height =
        window.innerWidth < 400 ? window.innerHeight + 100 : window.innerHeight;
      gameStateRef.current.knifeY = canvas.height - 145; //vị trí của phi tiêu khi chưa ghim vào bàn quay
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const throwKnife = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canThrow && knivesRemaining > 0 && !isGameOver) {
      gameStateRef.current.isKnifeMoving = true;
      gameStateRef.current.knifeY = canvas.height - 145;
      setCanThrow(false);
    }
  };

  useEffect(() => {
    socketIo.on(SocketEvent.START_GAME, (data: any) => {
      setGame(data);
    });
    return () => {
      socketIo.off(SocketEvent.START_GAME);
    };
  }, [setGame]);

  return (
    <div className="game-container h-full flex justify-between flex-col relative">
      <canvas
        ref={canvasRef}
        onClick={throwKnife}
        className="game-canvas z-10"
      />
      <div className="flex justify-between w-full absolute top-0 left-0 right-0 pt-4">
        <div className="flex flex-col gap-1 items-center justify-center">
          {scoresList.map((score, idx) => (
            <div
              key={idx}
              className="w-6 h-6 rounded border border-cyan-300 flex items-center justify-center"
            >
              {score === null ? (
                <img src={Objects} alt="Objects" className="w-4 h-4" />
              ) : (
                <p className="text-custom-sm-bold text-cyan-300">{score}</p>
              )}
            </div>
          ))}
          <div className=" px-2 py-1.5 relative bg-black/40 rounded-tr-lg rounded-br-lg border-r-2 border-t-2 border-b-2 border-cyan-300 inline-flex justify-center items-center gap-1.5">
            <p className="justify-start text-cyan-300 text-xl font-normal font-['Squada_One'] uppercase leading-5">
              {scoresList.reduce((a, b) => (a || 0) + (b || 0), 0)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-center justify-center">
          {scoresListOrther.map((score, idx) => (
            <div
              key={idx}
              className="w-6 h-6 rounded border border-cyan-300 flex items-center justify-center"
            >
              {score === null ? (
                <img src={Objects_red} alt="Objects" className="w-4 h-4" />
              ) : (
                <p className="text-custom-sm-bold text-fuchsia-500">{score}</p>
              )}
            </div>
          ))}

          <div className=" px-2 py-1.5 relative bg-black/40 rounded-tl-lg rounded-bl-lg border-l-2 border-t-2 border-b-2 border-cyan-300 inline-flex justify-center items-center gap-1.5">
            <p className="justify-start text-fuchsia-500 text-xl font-normal font-['Squada_One'] uppercase leading-5">
              {scoresListOrther.reduce((a, b) => (a || 0) + (b || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Score Display */}
      {floatingScore && (
        <div
          key={floatingScore.id}
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 animate-float-up"
          style={{
            animation: "floatUp 1.5s ease-out forwards",
          }}
        >
          <p
            className="text-white text-9xl font-bold"
            style={{
              opacity: 1,
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            {floatingScore.value}
          </p>
        </div>
      )}

      <ModalGame isOpen={isModalOpen} onClose={() => {}} />

      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-100px);
          }
        }
      `}</style>
    </div>
  );
};

export default Game;
