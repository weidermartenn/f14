import { render, screen, waitFor, fireEvent } from '@testing-library/vue';
import CommentsContainer from '../widgets/comments/ui/CommentsContainer.vue';
import { it, expect, describe, beforeEach, vi } from 'vitest';
import type { Comment } from '../entities/comment/types';

// Полный мок для supabaseHelper
vi.mock('../shared/api/sbHelper.ts', () => ({
  supabaseHelper: {
    fetchCommentsFromProject: vi.fn(),
    addComment: vi.fn().mockResolvedValue(true),
    fetchProject: vi.fn().mockResolvedValue({
      id: 'test-project-id',
      orgId: 'test-org-id',
      name: 'Test Project'
    }),
    fetchOrgMembers: vi.fn().mockResolvedValue([
      'user1@test.com',
      'user2@test.com',
      'test@example.com' // текущий пользователь
    ]),
    deleteComment: vi.fn().mockResolvedValue(true),
    editComment: vi.fn().mockImplementation((comment: Comment) => Promise.resolve(comment)),
    getUserId: vi.fn().mockImplementation((email: string) => {
      return Promise.resolve(email === 'test@example.com' ? 'current-user-id' : 'other-user-id');
    }),
  }
}));

// Мок для auth
vi.mock('../shared/lib/auth.ts', () => ({
  user: {
    value: {
      email: 'test@example.com',
      id: 'current-user-id'
    }
  }
}));

// Мок для supabase client
vi.mock('../shared/api/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: {}, error: null })
  }
}));

describe('CommentsContainer', () => {
  const mockComments: Comment[] = [
    {
      id: '1',
      comment: 'First comment',
      userId: 'user1',
      projectId: 'test-project-id',
      createdAt: new Date()
    },
    {
      id: '2',
      comment: 'Second comment',
      userId: 'user2',
      projectId: 'test-project-id',
      createdAt: new Date()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    const { supabaseHelper } = require('../shared/api/sbHelper.ts');
    supabaseHelper.fetchCommentsFromProject.mockResolvedValue([]);
    supabaseHelper.getUserId.mockResolvedValue('test-user-id');
  });

  it('1. Загружает комментарии при монтировании', async () => {
    const { supabaseHelper } = require('../shared/api/sbHelper.ts');
    supabaseHelper.fetchCommentsFromProject.mockResolvedValueOnce([mockComments[0]]);

    render(CommentsContainer, {
      props: { projectId: 'test-project-id' }
    });

    await waitFor(() => {
      expect(supabaseHelper.fetchCommentsFromProject).toHaveBeenCalledWith('test-project-id');
      expect(screen.getByText('First comment')).toBeInTheDocument();
    });
  });

  it('2. Отображает сообщение при отсутствии комментариев', async () => {
    const { supabaseHelper } = require('../shared/api/sbHelper.ts');
    supabaseHelper.fetchCommentsFromProject.mockResolvedValueOnce([]);

    render(CommentsContainer, {
      props: { projectId: 'test-project-id' }
    });

    await waitFor(() => {
      expect(screen.getByText(/Чат пуст/)).toBeInTheDocument();
    });
  });

  it('3. Добавляет новый комментарий', async () => {
    const { supabaseHelper } = require('../shared/api/sbHelper.ts');
    supabaseHelper.fetchCommentsFromProject.mockResolvedValue([]);

    render(CommentsContainer, {
      props: { projectId: 'test-project-id' }
    });

    const textarea = screen.getByRole('textbox');
    await fireEvent.update(textarea, 'New comment');
    await fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(supabaseHelper.addComment).toHaveBeenCalledWith({
        id: expect.any(String),
        projectId: 'test-project-id',
        userId: 'test-user-id',
        comment: 'New comment',
        createdAt: expect.any(Date)
      });
      expect(textarea).toHaveValue('');
    });
  });

  it('4. Не добавляет пустой комментарий', async () => {
    const { supabaseHelper } = require('../shared/api/sbHelper.ts');
    supabaseHelper.fetchCommentsFromProject.mockResolvedValue([]);

    render(CommentsContainer, {
      props: { projectId: 'test-project-id' }
    });

    await fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(supabaseHelper.addComment).not.toHaveBeenCalled();
      expect(screen.getByText(/Комментарий не может быть пустым/i)).toBeInTheDocument();
    });
  });

  it('5. Обрабатывает удаление комментария', async () => {
    const { supabaseHelper } = require('../shared/api/sbHelper.ts');
    supabaseHelper.fetchCommentsFromProject.mockResolvedValueOnce([mockComments[0]]);

    render(CommentsContainer, {
      props: { projectId: 'test-project-id' }
    });

    await waitFor(() => {
      expect(screen.getByText('First comment')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(supabaseHelper.deleteComment).toHaveBeenCalledWith('1');
      expect(screen.getByText(/Комментарий удалён/i)).toBeInTheDocument();
    });
  });

  it('6. Обновляет комментарии при изменении projectId', async () => {
    const { supabaseHelper } = require('../shared/api/sbHelper.ts');
    supabaseHelper.fetchCommentsFromProject
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockComments[0]]);

    const { rerender } = render(CommentsContainer, {
      props: { projectId: 'project-1' }
    });

    await waitFor(() => {
      expect(supabaseHelper.fetchCommentsFromProject).toHaveBeenCalledWith('project-1');
    });

    rerender({ projectId: 'project-2' });

    await waitFor(() => {
      expect(supabaseHelper.fetchCommentsFromProject).toHaveBeenCalledWith('project-2');
      expect(screen.getByText('First comment')).toBeInTheDocument();
    });
  });

  it('7. Показывает уведомление об ошибке при загрузке комментариев', async () => {
    const { supabaseHelper } = require('../shared/api/sbHelper.ts');
    supabaseHelper.fetchCommentsFromProject.mockRejectedValue(new Error('Load error'));

    render(CommentsContainer, {
      props: { projectId: 'test-project-id' }
    });

    await waitFor(() => {
      expect(screen.getByText(/Ошибка при загрузке комментариев/i)).toBeInTheDocument();
    });
  });

  it('8. Обрабатывает упоминания пользователей', async () => {
    const { supabaseHelper } = require('../shared/api/sbHelper.ts');
    supabaseHelper.fetchOrgMembers.mockResolvedValue([
      'user1@test.com',
      'user2@test.com'
    ]);

    render(CommentsContainer, {
      props: { projectId: 'test-project-id' }
    });

    const textarea = screen.getByRole('textbox');

    await fireEvent.input(textarea, {
      target: {
        value: '@',
        selectionStart: 1
      }
    });

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });

    const user1Option = screen.getByText('user1');
    await fireEvent.click(user1Option);

    expect(textarea).toHaveValue('@user1');
  });

  it('9. Отправляет уведомления при упоминании', async () => {
    const { supabaseHelper } = require('../shared/api/sbHelper.ts');
    supabaseHelper.fetchCommentsFromProject.mockResolvedValue([]);
    supabaseHelper.getUserId.mockImplementation((email: string) =>
      Promise.resolve(email === 'user1@test.com' ? 'user1-id' : 'user2-id')
    );

    render(CommentsContainer, {
      props: { projectId: 'test-project-id' }
    });

    const textarea = screen.getByRole('textbox');
    await fireEvent.update(textarea, 'Hello @user1');
    await fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      const { supabase } = require('../shared/api/supabaseClient');
      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(supabase.insert).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          userId: 'user1-id',
          type: 'mention'
        })
      ]));
    });
  });
});
