import { useMemo } from 'react'
import { createPortal } from 'react-dom'

function Portal({ children, elementId }: { elementId: string, children: React.ReactNode }) {
    const rootElement: any = useMemo(() => document.getElementById(elementId), [
        elementId,
    ])
    return createPortal(children, rootElement)
}

export default Portal