import { useRouter } from "next/router";
import { useRef, useState } from "react";
import BoardUI from "../components/BoardUI";
import { CREATE_SUCCESS, FAILURE_PREFIX, UPDATE_SUCCESS } from "../constants/string";
import { getBlankBoard, stepBoard, flipCell, badFlipCell, boardToString } from "../utils/logic";
import { request } from "../utils/network";
import { Board } from "../utils/types";

interface BoardInit {
    id: number,
    initBoard: Board,
    initBoardName: string,
    initUserName: string,
}

export interface BoardScreenProps {
    init?: BoardInit,
}

const BoardScreen = (props: BoardScreenProps) => {
    /**
     * @todo [Step 3] 请在下述一处代码缺失部分填写合适的代码，使得组件可以调用 logic.ts 中的代码处理点击棋盘事件
     * @todo [Step 4] 请在下述三处代码缺失部分填写合适的代码，使得点击行为的处理符合预期且计时器资源分配、释放合理
     */
    const [board, setBoard] = useState<Board>(props.init?.initBoard ?? getBlankBoard());
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>(props.init?.initUserName ?? "");
    const [boardName, setBoardName] = useState<string>(props.init?.initBoardName ?? "");
    const timerRef = useRef<undefined | NodeJS.Timer>(undefined);

    const router = useRouter();

    const step = () => {
        setBoard((board) => stepBoard(board));
    };
    const flip = (i: number, j: number) => {
        // Step 3 & 4 BEGIN
        // if AutoPlay mode is on, do nothing
        if(!autoPlay)
        // update board state by calling flipCell
            setBoard((board) => flipCell(board,i,j));
        // Step 3 & 4 END
    };

    const startAutoPlay = () => {
        // Step 4 BEGIN
        // Turn on AutoPlay mode and set Timer
        setAutoPlay(true);
        timerRef.current = setInterval(()=>{
            setBoard((board)=>stepBoard(board));}
        ,500);
        // Step 4 END
    };
    const stopAutoPlay = () => {
        // Step 4 BEGIN
        // Turn off AutoPlay mode and release Timer
        setAutoPlay(false);
        clearInterval(timerRef.current);
        // Step 4 END
    };

    const saveBoard = () => {
        request(
            "/api/boards",
            "POST",
            {
                userName: userName,
                boardName: boardName,
                board: boardToString(board),
            }
        )
            .then((res) => alert(res.isCreate ? CREATE_SUCCESS : UPDATE_SUCCESS))
            .catch((err) => alert(FAILURE_PREFIX + err));
    };
    const updateBoard = () => {
        request(
            `/api/boards/${props.init?.id}`,
            "PUT",
            {
                userName: userName,
                boardName: boardName,
                board: boardToString(board),
            },
        )
            .then(() => alert(UPDATE_SUCCESS))
            .catch((err) => alert(FAILURE_PREFIX + err));
    };

    return (
        <div style={{ padding: 12 }}>
            {props.init ? <h4> Replay Mode, Board ID: {props.init.id} </h4> : <h4> Free Mode </h4>}
            <BoardUI board={board} flip={flip} />
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <button onClick={step} disabled={autoPlay}>
                        Step the board
                    </button>
                    <button onClick={() => setBoard(getBlankBoard())} disabled={autoPlay}>
                        Clear the board
                    </button>
                    {props.init ? (
                        <button onClick={() => setBoard(props.init?.initBoard as Board)} disabled={autoPlay}>
                            Undo all changes
                        </button>
                    ) : null}
                    <button onClick={startAutoPlay} disabled={autoPlay}>
                        Start auto play
                    </button>
                    <button onClick={stopAutoPlay} disabled={!autoPlay}>
                        Stop auto play
                    </button>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={userName}
                        disabled={autoPlay}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Name of this Board"
                        value={boardName}
                        disabled={autoPlay}
                        onChange={(e) => setBoardName(e.target.value)}
                    />
                    <button onClick={props.init ? updateBoard : saveBoard} disabled={autoPlay}>
                        {props.init ? "Update" : "Save"} board
                    </button>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <button onClick={() => router.push("/list")}>
                        Go to full list
                    </button>
                    {props.init ? (
                        <button onClick={() => router.push("/")}>
                            Go back to free mode
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default BoardScreen;
