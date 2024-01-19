import express from 'express';
import Todo from '../schemas/todo.schema.js';
import joi from 'joi';
const router = express.Router();

//joi검사
const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(), //유효성 검사 - 문자열 여부, 1 =< 문자 수 =< 50, 필수여부
});
//할일 등록 API
router.post('/todos', async (req, res, next) => {
  try {
    //DB는 비동기 작업으로 해야 하기 때문에 async를 붙여줘야 함(아니면 db 조회하는 동안 다 멈춤)
    //1. 클라이언트로부터 받아온 value 데이터를 가져옴
    //   const { value } = req.body;

    const validation = await createdTodoSchema.validateAsync(req.body); //await + validateAsync : 비동기 유효성 검사

    const { value } = validation;

    //1-1. 만약, 클라이언트가 value 데이터를 전달하지 않았을 때, 클라이언트에게 에러 메세지 전달
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: '해야할 일(value) 데이터가 존재하지 않습니다.' });
    }
    //2. 해당하는 마지막 order 데이터를 조회함
    //findOne은 1개의 데이터만 조회함
    //order라는 필드를 기준으로 정렬(-붙이면 내림차순)
    //Todo는 데이터베이스가 아니라 컬렉션임
    const todoMaxOrder = await Todo.findOne().sort('-order').exec();
    //3. 만약 존재한다면 현재 해야 할 일을 +1하고, order데이터가 존재하지 않는다면, 1로 할당함
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;
    //4. 해야할 일 등록함
    const todo = new Todo({ value, order }); // Todo를 인스턴스화 한 것
    await todo.save(); //데이터베이스에 저장하는 메서드
    //5. 해야할 일을 클라이언트에게 반환함
    return res.status(201).json({ todo: todo });
  } catch (error) {
    //Router 다음에 있는 에러 처리 미들웨어 실행
    next(error);
  }
});

//해야할 일 목록 조회 API
router.get('/todos', async (req, res) => {
  //1. 해야할 일 목록 조회 진행
  const todos = await Todo.find().sort('-order').exec();
  //2. 해야할 일 목록 조회 결과 클라이언트에게 반환
  return res.status(200).json({ todos });
});

//해야할 일 순서 변경, 완로 & 해제, 내용 변경 API
router.patch('/todos/:todoId', async (req, res) => {
  //필요한 데이터 추출
  const { todoId } = req.params;
  const { order, doneAt, value } = req.body;
  //현재 변경하려는 나의 order가 무엇인지 알아야 함
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 해야할 일이로다!' });
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      // 만약, 이미 해당 order 값을 가진 '해야할 일'이 있다면, 해당 '해야할 일'의 order 값을 변경하고 저장합니다.
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    // 변경하려는 '해야할 일'의 order 값을 변경합니다.
    currentTodo.order = order;
  }

  if (doneAt !== undefined) {
    currentTodo.doneAt = doneAt ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }

  await currentTodo.save();

  return res.status(200).json({});
});

//해야할 일 삭제 API
router.delete('/todos/:todoId', async (req, res) => {
  const { todoId } = req.params;
  const todo = await Todo.findById(todoId).exec();

  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 해야할 일 정보로다!' });
  }
  await Todo.deleteOne({ _id: todoId }).exec();

  return res.status(200).json({});
});

//할 일 내용 변경 API 만들기

export default router;
