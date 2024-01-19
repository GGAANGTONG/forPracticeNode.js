import mongoose from 'mongoose';

const toDoSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  doneAt: {
    type: Date,
    required: false,
  },
});

//프론트엔드 서빙을 위한 코드(지금은 별로 안중요함)
toDoSchema.virtual('todoId').get(function () {
  return this._id.toHexString();
});
toDoSchema.set('toJSON', {
  virtuals: true,
});

//스키마를 이용해서 모델을 정의하고, 해당하는 모델을 외부로 전달함
export default mongoose.model('ToDo', toDoSchema);
