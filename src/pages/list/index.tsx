import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DELETE_SUCCESS, DELETE_USER_BOARD_SUCCESS, FAILURE_PREFIX } from "../../constants/string";
import { request } from "../../utils/network";
import { BoardMetaData } from "../../utils/types";

interface ListScreenProps {
    userName?: string;
}

const ListScreen = (props: ListScreenProps) => {
    /**
     * @todo [Step 5] 请在下述一处代码缺失部分填写合适的代码，完成游戏记录列表页面 UI
     * @todo [Step 6] 请在下述两处代码缺失部分填写合适的代码，完成网络请求的管理
     */
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [boardList, setBoardList] = useState<BoardMetaData[]>([]);

    const router = useRouter();
    const query = router.query;

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query]);

    const fetchList = () => {
        setRefreshing(true);
        request(props.userName ? `/api/user/${props.userName}` : "/api/boards", "GET")
            .then((res) => {
                setBoardList(res.boards.map((val: any) => ({ ...val, name: val.boardName })));
                setRefreshing(false);
            })
            .catch((err) => {
                alert(FAILURE_PREFIX + err);
                setRefreshing(false);
            });
    };
    const deleteBoard = (id: number) => {
        // Step 6 BEGIN
        // 1. Delete the board from the server
        request(`/api/boards/${id}`, "DELETE")
            .then((res) => {
                //2-1. If the board is deleted successfully, refresh the list, and pop up a success message
                fetchList();
                alert(DELETE_SUCCESS);
            })
            .catch((err) => {
                //2-2. If the board is not deleted successfully, pop up a failure message
                alert(FAILURE_PREFIX + err);
            });
        // Step 6 END
    };
    const deleteUserBoard = () => {
        // Step 6 BEGIN
        // 1. Delete all boards of the user from the server
        request(`/api/user/${props.userName}`, "DELETE")
            .then((res) => {
                // 2-1. If all boards are deleted successfully, refresh the list, and pop up a success message
                alert(DELETE_USER_BOARD_SUCCESS);
                router.push("/list");
            })
            .catch((err) => {
                // 2-2. If boards are not deleted successfully, pop up a failure message
                alert(FAILURE_PREFIX + err);
            });
        // Step 6 END
    };

    return refreshing ? (
        <p> Loading... </p>
    ) : (
        <div style={{ padding: 12 }}>
            {props.userName ? (
                <h4> Boards of {props.userName} </h4>
            ) : null}
            <button onClick={() => router.push("/")}>
                Go back to free mode
            </button>
            {props.userName ? (
                <button onClick={() => router.push("/list")}>
                    Go to full list
                </button>
            ) : null}
            {props.userName ? (
                <button onClick={deleteUserBoard}>
                    Delete all boards of this user
                </button>
            ) : null}
            {boardList.length === 0 ? (
                <p> Empty list. </p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>{
                    // Step 5 BEGIN
                    boardList.map((board) => {
                        var date = new Date(board.createdAt * 1000);
                        var createdTime = date.toLocaleString("zh-CN");
                        return (
                            <div key = {board.id} style={{ padding: 8 }}>
                                <div>ID: {board.id}</div>
                                <div>Name: {board.name}</div>
                                <div>Created at: {createdTime}</div>
                                <div>Created by: {board.userName}</div>
                                <button onClick={() => router.push("/" + board.id)}>
                                    Play it
                                </button>
                                <button onClick={() => deleteBoard(board.id)}>
                                    Delete it
                                </button>
                                <button onClick={() => router.push("/list/" + board.userName)}>
                                    View this user
                                </button>
                            </div>
                        );
                    })
                    // Step 5 END
                }</div>
            )}
        </div>
    );
};

export default ListScreen;