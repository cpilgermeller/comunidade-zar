'use client'

import { useState } from 'react'
import { Avatar } from './avatar'
import { CommentForm } from './comment-form'
import { deleteComment, toggleCommentLike } from '@/app/actions/comments'
import { formatDate } from '@/lib/utils'
import { Heart, Reply, Trash2, ChevronDown } from 'lucide-react'

type Comment = {
  id: string
  body: string
  createdAt: Date
  author: { id: string; name: string }
  likes: { userId: string }[]
  replies: Comment[]
}

type Props = {
  comment: Comment
  threadId: string
  currentUserId: string
  isAdmin: boolean
  depth?: number
}

export function CommentNode({ comment, threadId, currentUserId, isAdmin, depth = 0 }: Props) {
  const [showReply, setShowReply] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const liked = (comment.likes ?? []).some((l) => l.userId === currentUserId)
  const canDelete = comment.author.id === currentUserId || isAdmin
  const replies = comment.replies ?? []

  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}>
      <div className="flex gap-3 py-3">
        <Avatar name={comment.author.name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-800">{comment.author.name}</span>
            <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
          <div className="flex items-center gap-3 mt-2">
            <form action={toggleCommentLike.bind(null, comment.id, threadId)}>
              <button
                type="submit"
                className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}
              >
                <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
                {(comment.likes ?? []).length > 0 && (comment.likes ?? []).length}
              </button>
            </form>
            {depth < 3 && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-violet-600 transition-colors"
              >
                <Reply size={13} /> Responder
              </button>
            )}
            {canDelete && (
              <form action={deleteComment.bind(null, comment.id, threadId)}>
                <button type="submit" className="flex items-center gap-1 text-xs text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </form>
            )}
          </div>
          {showReply && (
            <div className="mt-3">
              <CommentForm
                threadId={threadId}
                parentId={comment.id}
                authorName={comment.author.name}
                onCancel={() => setShowReply(false)}
                placeholder={`Responder para ${comment.author.name}...`}
              />
            </div>
          )}
        </div>
      </div>
      {replies.length > 0 && (
        <>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-violet-600 ml-10 mb-1 transition-colors"
          >
            <ChevronDown size={13} className={showReplies ? 'rotate-180' : ''} />
            {showReplies ? 'Ocultar' : `Ver ${replies.length} resposta${replies.length > 1 ? 's' : ''}`}
          </button>
          {showReplies && replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              threadId={threadId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              depth={depth + 1}
            />
          ))}
        </>
      )}
    </div>
  )
}
