using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PersistentDataStructures
{
    class PersistentQueue<T>
    {
        private PersistentStack<T> Left;
        private PersistentStack<T> LeftRecopy;
        private PersistentStack<T> Right;
        private PersistentStack<T> RightRecopy;
        private PersistentStack<T> TempRight;

        private Boolean IsRecopy;
        private Int32 ToCopy;
        private Boolean Copied;

        public Boolean Empty
        {
            get
            {
                return !IsRecopy && Right.Count == 0;
            }
        }

        private PersistentQueue(
            PersistentStack<T> left, 
            PersistentStack<T> leftRecopy, 
            PersistentStack<T> right, 
            PersistentStack<T> rightRecopy, 
            PersistentStack<T> tempRight,
            Boolean isRecopy,
            Int32 toCopy,
            Boolean copied
            ) : this()
        {
            Left = left;
            LeftRecopy = leftRecopy;
            Right = right;
            RightRecopy = rightRecopy;
            TempRight = tempRight;

            IsRecopy = isRecopy;
            ToCopy = toCopy;
            Copied = copied;
        }

        public PersistentQueue()
        {
            Left = new PersistentStack<T>();
            LeftRecopy = new PersistentStack<T>();
            Right = new PersistentStack<T>();
            RightRecopy = new PersistentStack<T>();
            TempRight = new PersistentStack<T>();

            IsRecopy = false;
            ToCopy = 0;
            Copied = false;
        }

        public PersistentQueue<T> Push(T element)
        {
            if (!IsRecopy)
            {
                PersistentStack<T> newLeft = Left.Push(element);
                PersistentQueue<T> newQueue = new PersistentQueue<T>(newLeft, LeftRecopy, Right, RightRecopy, TempRight, IsRecopy, ToCopy, Copied);
                return newQueue.CheckRecopy();
            }
            else
            {
                PersistentStack<T> newLeftRecopy = LeftRecopy.Push(element);
                PersistentQueue<T> newQueue = new PersistentQueue<T>(Left, newLeftRecopy, Right, RightRecopy, TempRight, IsRecopy, ToCopy, Copied);
                return newQueue.CheckNormal();
            }
        }

        public PersistentQueue<T> Pop()
        {
            if (!IsRecopy)
            {
                PersistentStack<T> newRight = Right.Pop();
                PersistentQueue<T> newQueue = new PersistentQueue<T>(Left, LeftRecopy, newRight, RightRecopy, TempRight, IsRecopy, ToCopy, Copied);
                return newQueue.CheckRecopy();
            }
            else
            {
                PersistentStack<T> newRightRecopy = RightRecopy.Pop();
                PersistentStack<T> newRight = Right;
                Int32 curToCopy = ToCopy;
                if (ToCopy > 0)
                {
                    --curToCopy;
                }
                else
                {
                    newRight = Right.Pop();
                }
                PersistentQueue<T> newQueue = new PersistentQueue<T>(Left, LeftRecopy, newRight, newRightRecopy, TempRight, IsRecopy, curToCopy, Copied);
                return newQueue.CheckNormal();
            }
        }

        public T Peek()
        {
            if (!IsRecopy)
            {
                return Right.Peek();
            }
            else
            {
                return RightRecopy.Peek();
            }
        }

        private PersistentQueue<T> CheckRecopy()
        {
            if (Left.Count > Right.Count)
            {
                PersistentQueue<T> newQueue = new PersistentQueue<T>(Left, LeftRecopy, Right, Right, TempRight, true, Right.Count, false);
                return newQueue.CheckNormal();
            }
            else
            {
                return new PersistentQueue<T>(Left, LeftRecopy, Right, RightRecopy, TempRight, false, ToCopy, Copied);
            }
        }

        private PersistentQueue<T> CheckNormal()
        {
            PersistentQueue<T> newQueue = this.AdditionalsOperations();
            return new PersistentQueue<T>(
                newQueue.Left, 
                newQueue.LeftRecopy, 
                newQueue.Right, 
                newQueue.RightRecopy, 
                newQueue.TempRight, 
                newQueue.TempRight.Count != 0, 
                newQueue.ToCopy, 
                newQueue.Copied);
        }

        private PersistentQueue<T> AdditionalsOperations()
        {
            Int32 toDo = 3;

            PersistentStack<T> newLeft = Left;
            PersistentStack<T> newLeftRecopy = LeftRecopy;
            PersistentStack<T> newRight = Right;
            PersistentStack<T> newTempRight = TempRight;

            Boolean newCopied = Copied;
            Int32 newToCopy = ToCopy;

            while (!newCopied && toDo > 0 && newRight.Count > 0)
            {
                T x = newRight.Peek();
                newRight = newRight.Pop();

                newTempRight = newTempRight.Push(x);

                --toDo;
            }

            while (toDo > 0 && newLeft.Count > 0)
            {
                newCopied = true;

                T x = newLeft.Peek();
                newLeft = newLeft.Pop();

                newRight = newRight.Push(x);

                --toDo;
            }

            while (toDo > 0 && newTempRight.Count > 0)
            {
                T x = newTempRight.Peek();
                newTempRight = newTempRight.Pop();

                if (newToCopy > 0)
                {
                    newRight = newRight.Push(x);
                    --newToCopy;
                }
                --toDo;
            }

            if (newTempRight.Count == 0)
            {
                PersistentStack<T> temp = newLeft;
                newLeft = newLeftRecopy;
                newLeftRecopy = temp;
            }

            return new PersistentQueue<T>(newLeft, newLeftRecopy, newRight, RightRecopy, newTempRight, IsRecopy, newToCopy, newCopied);
        }
    }
}
