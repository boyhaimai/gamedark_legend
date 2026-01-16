import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import UserModel, { User } from 'src/database/models/user.model';

interface TreeNode {
  user: User; // User document
  children: TreeNode[];
  depth: number;
}

interface TreeSystemResult {
  rootUser: User;
  tree: TreeNode;
  totalUsers: number;
  depthRange: {
    from: number;
    to: number;
  };
}

@Injectable()
export class TreeSystemService {
  constructor(
    @InjectModel(UserModel.collection.name)
    private userModel: Model<User>,
  ) {}

  /**
   * Xây dựng hệ thống cây 10 tầng dựa trên user được truyền vào
   * @param user - User để làm căn cứ xây dựng cây
   * @returns TreeSystemResult - Kết quả chứa thông tin cây và root user
   */
  async buildTreeSystem(user: User): Promise<TreeSystemResult> {
    const userDepth = user.depth;

    // Tính toán range depth cho 10 tầng
    const depthRange = this.calculateDepthRange(userDepth);

    // Tìm root user (user có depth thấp nhất trong range)
    const rootUser = await this.findRootUser(user, depthRange.from);

    // Xây dựng cây từ root user
    const tree = await this.buildTreeFromRoot(rootUser, depthRange);

    // Đếm tổng số users trong cây
    const totalUsers = this.countTreeNodes(tree);

    return {
      rootUser,
      tree,
      totalUsers,
      depthRange,
    };
  }

  /**
   * Tính toán range depth cho 10 tầng
   * @param userDepth - Depth của user hiện tại
   * @returns Object chứa from và to depth
   */
  private calculateDepthRange(userDepth: number): { from: number; to: number } {
    let fromDepth: number;
    let toDepth: number;

    if (userDepth <= 9) {
      // Nếu user depth <= 9, lấy từ 0 đến depth của user
      fromDepth = 0;
      toDepth = userDepth;
    } else {
      // Nếu user depth > 9, lấy 10 tầng trước user đó
      fromDepth = userDepth - 9;
      toDepth = userDepth;
    }

    return { from: fromDepth, to: toDepth };
  }

  /**
   * Tìm root user (user có depth thấp nhất trong cây của user hiện tại)
   * @param user - User hiện tại
   * @param targetDepth - Depth mục tiêu của root
   * @returns Root user
   */
  private async findRootUser(user: User, targetDepth: number): Promise<User> {
    if (user.depth === targetDepth) {
      return user;
    }

    // Traverse lên parents để tìm user có depth = targetDepth
    let currentUser = user;

    while (currentUser && currentUser.depth > targetDepth) {
      if (currentUser.referrer) {
        currentUser = await this.userModel
          .findById(currentUser.referrer)
          .populate('referrer')
          .exec();
      } else {
        break;
      }
    }

    return currentUser || user;
  }

  /**
   * Xây dựng cây từ root user
   * @param rootUser - Root user
   * @param depthRange - Range depth cần lấy
   * @returns TreeNode
   */
  private async buildTreeFromRoot(
    rootUser: User,
    depthRange: { from: number; to: number },
  ): Promise<TreeNode> {
    const visited = new Set<string>();

    return await this.buildTreeNode(rootUser, depthRange, visited);
  }

  /**
   * Xây dựng một node trong cây
   * @param user - User để xây dựng node
   * @param depthRange - Range depth
   * @param visited - Set các user đã visit để tránh loop
   * @returns TreeNode
   */
  private async buildTreeNode(
    user: User,
    depthRange: { from: number; to: number },
    visited: Set<string>,
  ): Promise<TreeNode> {
    if (visited.has(user._id.toString())) {
      return {
        user,
        children: [],
        depth: user.depth,
      };
    }

    visited.add(user._id.toString());

    const node: TreeNode = {
      user,
      children: [],
      depth: user.depth,
    };

    // Nếu user depth đã đạt max range thì không lấy children nữa
    if (user.depth >= depthRange.to) {
      return node;
    }

    // Lấy tất cả children của user trong range depth
    const children = await this.userModel
      .find({
        referrer: user._id,
        depth: { $gte: depthRange.from, $lte: depthRange.to },
      })
      .populate('referrer')
      .exec();

    // Xây dựng children nodes
    for (const child of children) {
      const childNode = await this.buildTreeNode(child, depthRange, visited);
      node.children.push(childNode);
    }

    return node;
  }

  /**
   * Đếm tổng số nodes trong cây
   * @param node - Root node
   * @returns Số lượng nodes
   */
  private countTreeNodes(node: TreeNode): number {
    let count = 1; // Đếm node hiện tại

    for (const child of node.children) {
      count += this.countTreeNodes(child);
    }

    return count;
  }

  /**
   * Lấy tất cả users trong một depth cụ thể từ cây
   * @param node - Root node
   * @param targetDepth - Depth cần lấy
   * @returns Array users
   */
  getUsersByDepth(node: TreeNode, targetDepth: number): User[] {
    const users: User[] = [];

    if (node.depth === targetDepth) {
      users.push(node.user);
    }

    for (const child of node.children) {
      users.push(...this.getUsersByDepth(child, targetDepth));
    }

    return users;
  }

  /**
   * In ra cấu trúc cây (để debug)
   * @param node - Root node
   * @param indent - Indent level
   */
  printTree(node: TreeNode, indent: string = ''): void {
    console.log(
      `${indent}Depth ${node.depth}: ${node.user.username || node.user.code} (${node.user._id})`,
    );

    for (const child of node.children) {
      this.printTree(child, indent + '  ');
    }
  }

  /**
   * Tìm một user cụ thể trong cây
   * @param node - Root node
   * @param userId - ID của user cần tìm
   * @returns TreeNode hoặc null
   */
  findUserInTree(node: TreeNode, userId: string): TreeNode | null {
    if (node.user._id.toString() === userId) {
      return node;
    }

    for (const child of node.children) {
      const found = this.findUserInTree(child, userId);
      if (found) {
        return found;
      }
    }

    return null;
  }

  /**
   * Lấy thống kê cây
   * @param node - Root node
   * @returns Object chứa thống kê
   */
  getTreeStats(node: TreeNode): {
    totalUsers: number;
    usersByDepth: Record<number, number>;
    maxDepth: number;
    minDepth: number;
  } {
    const stats = {
      totalUsers: 0,
      usersByDepth: {} as Record<number, number>,
      maxDepth: -1,
      minDepth: Infinity,
    };

    this.calculateTreeStats(node, stats);

    return stats;
  }

  private calculateTreeStats(
    node: TreeNode,
    stats: {
      totalUsers: number;
      usersByDepth: Record<number, number>;
      maxDepth: number;
      minDepth: number;
    },
  ): void {
    stats.totalUsers++;

    if (!stats.usersByDepth[node.depth]) {
      stats.usersByDepth[node.depth] = 0;
    }
    stats.usersByDepth[node.depth]++;

    stats.maxDepth = Math.max(stats.maxDepth, node.depth);
    stats.minDepth = Math.min(stats.minDepth, node.depth);

    for (const child of node.children) {
      this.calculateTreeStats(child, stats);
    }
  }
}
