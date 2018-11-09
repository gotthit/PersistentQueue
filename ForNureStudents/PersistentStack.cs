using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PersistentDataStructures
{
    public class PersistentStack<T>
    {
        private T Value;
        private PersistentStack<T> Previous;

        public Int32 Count { get; private set; }

        private PersistentStack(PersistentStack<T> prev, T newElement) : this()
        {
            Value = newElement;
            Count = prev.Count + 1;
            Previous = prev;
        }

        public PersistentStack()
        {
            Count = 0;
        }

        public PersistentStack<T> Push(T element)
        {
            return new PersistentStack<T>(this, element);
        }

        public PersistentStack<T> Pop()
        {
            if (Count == 0)
            {
                throw new InvalidOperationException();
            }

            return this.Previous;
        }

        public T Peek()
        {
            if (Count == 0)
            {
                throw new InvalidOperationException();
            }

            return this.Value;
        }
    }
}
