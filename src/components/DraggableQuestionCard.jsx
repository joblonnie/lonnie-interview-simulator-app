import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuestionCard from './QuestionCard';

const DraggableQuestionCard = ({ question, isEditMode, isFollowup, onAddAfter, onAddFollowup, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <QuestionCard
        question={question}
        isEditMode={isEditMode}
        isFollowup={isFollowup}
        onAddAfter={onAddAfter}
        onAddFollowup={onAddFollowup}
        {...props}
      />
    </div>
  );
};

export default DraggableQuestionCard;
