---
slug: zookeeper mian-shi-ti-gui-zong
title: zookeeper 面试题归总
authors:
  name: zhoujun134
  title: 不要等! 不管想做什么, 都要立刻动起来。
  url: https://github.com/zhoujun134
  image_url: https://img.zbus.top/zbus/logo.jpg
tags: [随笔]
image: https://img.zbus.top/zbus/blog202403150754487.webp
---
 
  
<!-- truncate -->  
 ![img](https://img.zbus.top/zbus/blog202405102244410.jpg)

Zookeeper 是个数据库，文件存储系统，并且有监听通知机制（观察者模式）

## 1 zookeeper 集群如何进行故障迁移？

ZooKeeper处理节点的故障转移通过选举新的Leader节点来完成。ZooKeeper集群中的每个节点都有一个状态，可以是Leader、Follower或Observer。当Leader节点出现故障时，集群中的其他节点会开始一个新的Leader选举过程。选举规则是，节点会向其他节点发送一个请求，请求得到超过半数节点的认可后，该节点就成为新的Leader。

一旦新的Leader节点选举成功，集群中的所有节点都会知道新的Leader节点是谁，然后继续处理客户端请求。在这个过程中，ZooKeeper保持了数据的一致性和可用性，确保集群的正常运行。当故障节点恢复后，它会重新加入集群并成为Follower节点，继续参与集群的工作。

## 2 zookeeper 有遇到过节点过多的情况吗？

zookeeper的一个目录下的znode节点过多，导致在执行ls 和rmr命令的时候，直接终止会话退出，无法递归删除下面的子节点，具体情况如下（生产环境的zookeeper是clickhouse的元数据管理集群，有一个故障是clickhouse副本同步堆积问题），接下来的操作需要知道这个子节点中的znode有序节点是怎么命名的，一般都是‘节点名称-000000xxxxxx’，由于无法获取子节点的列表，所以需要通过循环删除节点找到，大概的区间，然后再逐条尝试删除node

这边写了一个jave的操作代码如下

```java
import org.apache.zookeeper.KeeperException;
import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher;
import org.apache.zookeeper.ZooKeeper;

import java.io.IOException;

public class DeleChildNode {
    public static void main(String[] args) throws IOException, InterruptedException, KeeperException {
        if (0 == args.length) {
            System.out.println("没有zkurl和zkpath参数，自动退出，参数样例：127.0.0.1:2181 /clickhouse/2/table/host/replices/queue/ 10000 9999999999 10001");
            System.exit(0);
        }
        System.out.println("zkurl:" + args[0] + "\tzkpath:" + args[1] + "\t起始位置：" + args[2] + "\t结束位置：" + args[3] + "\t步长：" + args[4] );
        ZooKeeper zk = new ZooKeeper(args[0], 500000, new Watcher() {
            // 监控所有被触发的事件
            public void process(WatchedEvent event) {
                // dosomething
                System.out.println("成功建立监听连接。。。");
            }
        });
        String t;
        int start = Integer.parseInt(args[2]);
        int end = Integer.parseInt(args[3]);
        int length = Integer.parseInt(args[4]);
        String queue;
        String[] zore = {"0", "00", "000", "0000", "00000"};
        for (int i = start; i < end; i = i + length) {
            try {
                t = i + "";
                queue = "queue-" + zore[10 - t.length() - 1] + t;
//                System.out.println(args[1] + queue);
                zk.delete(args[1] + queue, -1);
                System.out.println("success："+args[1] + queue);
            } catch (Exception e) {
                System.out.println("fail："+e.getMessage());
            }
        }
        zk.close();
    }
}
```

## 3 什么事 CAP 定理？

CAP（Consistency（一致性）、Availability（可用性）、Partition tolerance（分区容错性））是分布式系统中的三个重要特性。分布式系统要满足CAP中的两个特性，但无法同时满足三个特性，只能在C、A、P中选择两个。

一致性（Consistency）：指的是分布式系统中所有的节点在同一时间具有相同的数据副本，即更新操作成功并返回客户端后，所有的节点访问数据的结果都是一致的。
可用性（Availability）：指系统提供的服务必须一直处于可用状态，即使出现了部分故障，也不能影响系统的正常运行。
	分区容错性（Partition tolerance）：指系统能够在网络分区的情况下，仍能保证一致性和可用性。
在分布式系统中，由于网络延迟、节点故障等原因，可能会出现数据不一致的情况。因此，在设计分布式系统时，需要根据实际情况，权衡C、A、P三个特性，选择最适合自己的方案。

ZooKeeper保证的是一致性和分区容错性，ZooKeeper不能保证每次服务请求的可⽤
性，在极端环境下，ZooKeeper可能会丢弃⼀些请求，消费者程序需要重新请求才能获得结果。
另外在进⾏leader选举时集群都是不可⽤，所以说，ZooKeeper不能保证服务可⽤性

## 4 什么是 ZAB 协议

ZAB（ZooKeeper Atomic Broadcast）协议是ZooKeeper的核心算法，用于保证ZooKeeper集群的数据一致性和高可用性。

在ZooKeeper中，所有的数据操作都必须经过ZAB协议进行广播，然后由所有的服务器按照相同的顺序执行，从而保证集群中所有服务器的数据状态是一致的。ZAB协议主要包括两个阶段：
1.Leader选举阶段：集群中的所有服务器通过竞选Leader的方式，选出一个Leader来负责数据的同步和更新。
2.数据同步阶段：Leader负责将客户端的请求广播给集群中的所有服务器，并根据一定的顺序进行数据同步和更新。

ZAB协议的核心思想是，保证集群中所有服务器的数据状态是一致的，并且在Leader故障时能够快速选举新的Leader，从而保证集群的高可用性。

什么是Zab

Zab（Zookeeper Atomic Broadcast）是为ZooKeeper协设计的崩溃恢复原子广播协议，
它保证Zookeeper集群数据的一致性和命令的全局有序性

zab在广播状态中保证以下特征:  
	**可靠传递:**  如果消息m由一台服务器传递，那么它最终将由所有服务器传递。
	**全局有序:**  如果一个消息a在消息b之前被一台服务器交付，那么所有服务器都交付了a和b，并且a先于b。
	**因果有序:**  如果消息a在因果上先于消息b并且二者都被交付，那么a必须排在b之前。
	

有序性是zab协议必须要保证的一个很重要的属性，因为zookeeper是以类似目录结构的数据结构存储数据的，必须要求命名的有序性

比如一个命名a创建路径为/test，然后命名b创建路径为/test/123，如果不能保证有序性b命名在a之前，b命令会因为父节点不存在而创建失败。

整个写请求类似一个二阶段的提交。当收到客户端的写请求的时候会经历以下几个步骤：
1. Leader收到客户端的写请求，生成一个事务（Proposal），其中包含了zxid；
2. Leader开始广播该事务，需要注意的是所有节点的通讯都是由一个FIFO的队列维护的；
3. Follower接受到事务之后，将事务写入本地磁盘，写入成功之后返回Leader一个ACK；
4. Leader收到过半的ACK之后，开始提交本事务，并广播事务提交信息
5. 从节点开始提交本事务。

由以上流程可知，zookeeper通过二阶段提交来保证集群中数据的一致性，因为只需要收到过半的ACK
就可以提交事务，所以zookeeper的数据并不是强一致性。
zab协议的有序性保证是通过几个方面来体现的，第一是，服务之前⽤TCP协议进行通讯，保证在网络
传输中的有序性；第二，节点之前都维护了一个FIFO的队列，保证全局有序性；第三，通过全局递增的zxid保证因果有序性。

## 5 简述Leader选举算法和流程

选举算法和流程：FastLeaderElection (默认提供的选举算法)

⽬前有5台服务器，每台服务器均没有数据，它们的编号分别是1,2,3,4,5,按编号依次启动，它们的选择举过程如下：
	一：服务器1启动，给⾃⼰投票，然后发投票信息，由于其它机器还没有启动所以它收不到反馈信息，
服务器1的状态⼀直属于Looking。

二：服务器2启动，给⾃⼰投票，同时与之前启动的服务器1交换结果，由于服务器2的编号⼤所以服务
器2胜出，但此时投票数没有⼤于半数，所以两个服务器的状态依然是LOOKING。

三：服务器3启动，给⾃⼰投票，同时与之前启动的服务器1,2交换信息，由于服务器3的编号最⼤所以
服务器3胜出，此时投票数正好⼤于半数，所以服务器3成为leader，服务器1,2成为follower。

四：服务器4启动，给⾃⼰投票，同时与之前启动的服务器1,2,3交换信息，尽管服务器4的编号⼤，但之前服务器3已经胜出，所以服务器4只能成为follower。

五：服务器5启动，后⾯的逻辑同服务器4成为follower。

如果一个节点收到了超过一半的投票，就认为自己成为了新的Leader，并开始向其他节点发送消息，宣布自己是Leader，并开始接受客户端的请求。如果没有节点收到超过一半的投票，选举失败，需要重新开始新一轮的Leader选举。

总之，Leader选举算法的目的是为了在集群中选出一个节点成为Leader，保证系统的高可用性和数据一致性。它的流程是一个不断循环的过程，直到选出一个新的Leader或者选举失败

## 6 Zookeeper 中有几种节点类型？

在Zookeeper中，有以下几种节点类型：

1.持久节点（Persistent Nodes）：这种节点在创建后，会一直存在于Zookeeper中，直到被显示删除。

2.临时节点（Ephemeral Nodes）：这种节点在创建它的客户端会话结束时被自动删除。如果客户端因为某种原因（比如网络问题）而断开连接，那么与之关联的临时节点也会被删除。

3.持久顺序节点（Persistent Sequential Nodes）：这种节点在创建时会自动分配一个递增的编号，编号是唯一的。节点的名称是由用户指定的前缀和分配的编号组成的。这种节点的特点是它们在同级节点中按照编号的顺序排列。

4.临时顺序节点（Ephemeral Sequential Nodes）：这种节点结合了临时节点和持久顺序节点的特点。它们在客户端会话结束时被删除，并按照编号的顺序排列。

## 7 Zookeeper 的 watcher 机制是怎样的？

Zookeeper的Watcher机制是一种事件通知机制，客户端可以在创建Zookeeper节点时设置Watcher，当节点状态发生变化时，Zookeeper服务器会将事件通知到与该节点关联的所有Watcher。Watcher可以是一次性的，也可以是持久性的，即当节点发生变化时，Watcher是否仍然有效。

Watcher机制的实现是通过在Zookeeper服务器上注册Watcher对象，在节点状态发生变化时，Zookeeper会将事件通知到Watcher对象。客户端需要在Watcher对象的回调函数中处理事件。通常，回调函数会重新获取节点状态，并根据新的状态进行相应的处理。

需要注意的是，Watcher机制并不是强一致性的，也就是说，当节点状态发生变化时，Watcher可能会得到旧的状态，而不是最新的状态。因此，在使用Watcher机制时，客户端需要自己处理这种情况，确保数据的一致性和正确性。

## 8 怎么用 zookeeper 实现分布式锁？

在Zookeeper中实现分布式锁的一般步骤如下：

1. 在Zookeeper中创建一个临时节点，节点名称可以是锁的名称，节点数据可以是当前客户端的ID，表示该客户端获取了锁。

2. 客户端获取锁时，先检查是否已经存在该锁，如果不存在，则创建该锁；如果已经存在，则等待。
3. 当客户端释放锁时，删除该节点。
4. 其他客户端在创建节点时，如果发现该锁已经存在，则设置Watcher，等待上一个持有锁的客户端释放锁之后，重新尝试获取锁。

以下是一个简单的Java代码示例，演示了如何使用Zookeeper实现分布式锁：

```java
public class DistributedLock {

    private static final String LOCK_BASE_PATH = "/mylock";
    private static final String LOCK_NAME_PREFIX = "lock_";

    private ZooKeeper zk;
    private String lockPath;

    public DistributedLock(String zkUrl) throws IOException, InterruptedException, KeeperException {
        this.zk = new ZooKeeper(zkUrl, 5000, null);
        createLockBasePath();
    }

    private void createLockBasePath() throws KeeperException, InterruptedException {
        if (zk.exists(LOCK_BASE_PATH, false) == null) {
            zk.create(LOCK_BASE_PATH, new byte[0], ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
        }
    }

    public void lock() throws KeeperException, InterruptedException {
        String path = zk.create(LOCK_BASE_PATH + "/" + LOCK_NAME_PREFIX, new byte[0], ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);
        lockPath = path;

        while (true) {
            List<String> children = zk.getChildren(LOCK_BASE_PATH, false);
            String minChild = Collections.min(children);

            if (lockPath.endsWith(minChild)) {
                return;
            } else {
                String prevChild = children.get(children.indexOf(lockPath.substring(LOCK_BASE_PATH.length() + 1)) - 1);
                zk.exists(LOCK_BASE_PATH + "/" + prevChild, new LockWatcher());
            }
        }
    }

    public void unlock() throws KeeperException, InterruptedException {
        zk.delete(lockPath, -1);
    }

    private class LockWatcher implements Watcher {
        @Override
        public void process(WatchedEvent event) {
            synchronized (this) {
                notifyAll();
            }
        }
    }
}
```
在上述代码中，我们使用了ZooKeeper的EPHEMERAL_SEQUENTIAL节点类型来创建临时节点，并通过节点名称来实现锁。在获取锁时，会不断检查当前节点是否是最小的节点，如果不是，则等待上一个节点的Watcher通知，重新尝试获取锁。

需要注意的是，这只是一个简单的示例代码，实际应用中可能需要考虑更多的情况，比如节点的超时时间、异常处理等。

## 9 zookeeper 选举机制是怎样的？

Zookeeper选举机制是一种基于Paxos算法的分布式一致性算法，可以保证在集群中只有一个节点拥有写权限，从而避免了数据的不一致性问题。在Zookeeper中，选举机制的实现是通过ZAB协议（Zookeeper Atomic Broadcast）来实现的。在Zookeeper中，选举机制的过程如下：

1. 每个节点都有一个唯一的ID，称为“myid”，节点之间通过网络互相通信。
2. 当集群中的某个节点失去了与其他节点的联系时，它会进入“寻找Leader”的状态。这个节点会向集群中的其他节点发起投票请求，请求其他节点选择它作为Leader。
3. 其他节点在收到投票请求后，会检查请求节点的Zxid（一个节点的事务ID），如果请求节点的Zxid比它们自己的Zxid更大，则将投票给请求节点。
4. 如果某个节点收到了超过一半的投票，则将自己设置为Leader，并向其他节点发送通知。
5. 其他节点在收到Leader的通知后，也会将自己的状态更新为“Follower”或“Observer”，并与Leader保持同步。

在 Zookeeper 的选举机制中，如果某个节点在选举中被误认为是Leader，而实际上其他节点已经选出了新的Leader，这个节点会自动放弃领导权，转为Follower或Observer状态，并与新的Leader同步数据。因此，Zookeeper 选举机制不会出现脑裂的问题。

需要注意的是，由于Zookeeper选举机制是基于Paxos算法实现的，因此在节点数量较多时，选举的过程可能会比较复杂和耗时。因此，在实际应用中，需要根据实际情况选择合适的节点数量和配置参数，以保证集群的可用性和性能。

## 10 什么是集群角色，服务状态，ZAB 状态，Zxid？

### zookeeper相关概念：

#### 集群角色

1. Leader：同一时间集群总只允许有一个Leader，提供对客户端的读写功能，
    负责将数据同步至各个节点；
2. Follower：提供对客户端读功能，写请求则转发给Leader处理，当Leader崩溃失联之后参与Leader
    选举；
3. Observer：与Follower不同的是但不参与Leader选举。

#### 服务状态

1. LOOKING：当节点认为群集中没有Leader，服务器会进入LOOKING状态，
    目的是为了查找或者选举Leader；
2. FOLLOWING：follower角色；
3. LEADING：leader角色；
4. OBSERVING：observer角色；

可以知道Zookeeper是通过自身的状态来区分自己所属的角色，来执行自己应该的任务。
	

ZAB状态: Zookeeper还给ZAB定义的4中状态，反应Zookeeper从选举到对外提供服务的过程中的四
个步骤。 状态枚举定义：

1. ELECTION: 集群进入选举状态，此过程会选出一个节点作为leader角色；
2. DISCOVERY：连接上leader，响应leader⼼跳，并且检测leader的角色是否更改，通过此步骤之后
    选举出的leader才能执行真正职务；
3. SYNCHRONIZATION：整个集群都确认leader之后，将会把leader的数据同步到各个节点，保证整
    个集群的数据一致性；
4. BROADCAST：过渡到广播状态，集群开始对外提供服务。

```java
public enum ZabState {
   ELECTION,
   DISCOVERY,
   SYNCHRONIZATION,
   BROADCAST
}
```

#### ZXID

 Zxid 是极为重要的概念，它是一个long型（64位）整数，分为两部分：纪元（epoch）部分和计数器（counter）部分，是一个全局有序的数字。 epoch 代表当前集群所属的哪个leader，leader的选举就类似一个朝代的更替，你前朝的剑不能斩本朝的官，用epoch代表当前命令的有效性，counter是一个递增的数字。

## 11 leader 选举什么时候进行？选举规则？选择流程是怎样的？

一：选举发生的时机 Leader发生选举有两个时机，一个是服务启动的时候当整个集群都没有leader节点
会进入选举状态，如果leader已经存在就会告诉该节点leader的信息，自己连接上leader，整个集群不用进入选举状态。

还有一个就是在服务运行中，可能会出现各种情况，服务宕机、断电、⽹络延迟很高的时候leader
都不能再对外提供服务了，所有当其他几点通过心跳检测到leader失联之后，集群也会进入选举状态。

二：选举规则 进入投票选举流程，怎么才能选举出leader？或者说按照什么规则来让其他节点都能选举
你当leader。

三： zab协议是按照几个比较规则来进行投票的筛选，如果你的票比我更好，就修改自身的投票信息，
改投你当leader。
下面代码是zookeeper投票比较规则：

```java
 return ((newEpoch > curEpoch)
 || ((newEpoch == curEpoch)
 && ((newZxid > curZxid)
 || ((newZxid == curZxid)
 && (newId > curId)))));
```

当其他节点的纪元比自身高投它，如果纪元相同比较自身的 zxid 的大小，选举 zxid 大的节点，这里的
zxid代表节点所提交事务最大的id，zxid越大代表该节点的数据越完整。

最后如果epoch和zxid都相等，则比较服务的serverId，这个Id是配置zookeeper集群所配置的，所以我
们配置zookeeper集群的时候可以把服务性能更高的集群的serverId配置大些，让性能好的机器担任
leader角色。

选举流程

时机和规则都有了，下面就是leader的选举流程：

所有节点第一票先选举自己当leader，将投票信息广播出去；

从队列中接受投票信息；

按照规则判断是否需要更改投票信息，将更改后的投票信息再次广播出去；

判断是否有超过一半的投票选举同一个节点，如果是选举结束根据投票结果设置自己的服务状态，

选举结束，否则继续进入投票流程。

## 12 简单介绍 zookeeper 四种服务状态和四种 ZAB 状态之间的状态流转

简单介绍zookeeper四种服务状态和四种ZAB状态之间的状态流转

1. 服务在启动或者和leader失联之后服务状态转为LOOKING；
2. 如果leader不存在选举leader，如果存在直接连接leader，此时zab协议状态为ELECTION；
3. 如果有超过半数的投票选择同一台server，则leader选举结束，被选举为leader的server服务状态为
LEADING，其他server服务状态为FOLLOWING/OBSERVING；
4. 所有server连接上leader，此时zab协议状态为DISCOVERY；
5. leader同步数据给learner，使各个从节点数据和leader保持一致，此时zab协议状态为
SYNCHRONIZATION；
6. 同步超过一半的server之后，集群对外提供服务，此时zab状态为BROADCAST。

## 13 zookeeper 的应用场景通常有哪些？

Zookeeper的应用场景：
	服务注册与订阅（共用节点）
	分布式通知（监听znode）
	服务命名（znode特性）
	数据订阅、发布（watcher）
	分布式锁（临时节点）

## 14 zookeeper 的节点类型有哪几类？

+ 持久化节点（zk断开节点还在）
+ 持久化顺序编号目录节点
+ 临时目录节点（客户端断开后节点就删除了）
+ 临时目录编号目录节点

节点名称都是唯一的

## 15 zookeeper 的节点是如何创建？

```bash
// 创建永久节点
create /test laogong 

// 创建临时节点
create -e /test laogong
//临时节点创建成功，如果断开链接，这个节点⾃然就消失了

//创建顺序节点
create -s /test

// 创建临时顺序节点
create -e -s /test
//退出后，重新连接，发现刚才创建的所有临时节点都没
```

## 16 zookeeper 怎么去保证分布式情况下的线程安全呢？并发竞争他是怎么控制？

synchronized，lock 也只能保证当前机器线程安全，分布式访问还是有问题

节点就可以解决这个问题。
	Zookeeper节点有个唯一的特性，就是创建过这个节点，再创建Zookeeper是会报错的，那就利用它的唯一性去实现分布式线程安全

## 17 zookeeper节点怎么实现分布式多线程？

节点怎么实现分布式多线程。全部去创建多线程，创建成功的第一个返回true他就可以继续下面的出票操作，后续的节点访问就会全部报错，出票失败，相当于把它们丢一个队列去排队

## 18 zookeeper节点怎么释放锁？

怎么释放锁

通过删除节点实现，删了再通知其他的人过来加锁，依次类推 Lock 在 finally 里面 unLock，现在我们在finally 删除节点。

## 19 Zookeeperzk加锁我们知道创建节点就够了，但是你得实现一个阻塞的效果呀，那怎么实现？

死循环，递归不断去尝试，直到成功，一个伪装的阻塞效果

## 20 Zookeeperzk怎么知道前面的老哥删除节点了呢？

监听节点的删除事件

## 21 第一个人加锁成功了，执行代码机器宕机了出现死锁，那节点是不是就不能删除了？

创建临时节点就好了，客户端连接一旦断开，别的就可以监听到节点的变化了

但监听机制也有不好的一面：
	监听，是所有服务都去监听一个节点的，节点的释放也会通知所有的服务器，

如果是900个服务器呢？
	这对服务器是很大的一个挑战，一个释放的消息，就好像一个牧羊犬进入了羊群，大家都四散而开，随
时可能干掉机器，会占用服务资源，网络带宽等等。这就是羊群效应

怎么解决监听机制的羊群效应问题？
	临时顺序节点，可以顺利解决这个问题
	全部监听一个节点问题很大，那我们就监听我们的前一个节点，
	因为是顺序的，很容易找到自己的前后

和之前监听一个永久节点的区别就在于，这里每个节点只监听了自己的前一个节点，
释放当然也是一个个释放下去，就不会出现羊群效应

## 22 说说 zk 在分布式锁中实践的一些缺点？

Zookeeper性能上可能并没有缓存服务那么高。

因为每次在创建锁和释放锁的过程中，都要动态创建、销毁瞬时节点来实现锁功能。
Zookeeper中创建和删除节点只能通过Leader服务器来执行，然后将数据同步到所有的Follower机器上。


使用Zookeeper也有可能带来并发问题，只是并不常见。

由于网络抖动，客户端可Zookeeper集群的session连接断了，那么Zookeeper以为客户端挂了，就会删除临时节点，这时候其他客户端就可以获取到分布式锁了。就可能产生并发问题了，这个问题不常见是因为Zookeeper有重试机制，一旦Zookeeper集群检测不到客户端的心跳，就会重试，Curator客户端支持多种重试策略。多次重试之后还不行的话才会删除临时节点。Tip：所以，选择一个合适的重试策略也很重要，要在锁的粒度和并发之间找一个平衡。

有更好的实现么？
	基于Redis的分布式锁

## 23 zk 常考知识点

Zookeeper通过临时节点，解决掉了死锁的问题，一旦客户端获取到锁之后突然挂掉（Session连接断开），那么这个临时节点就会自动删除掉，其他客户端自动获取锁。
	Zookeeper通过节点排队监听的机制，也实现了阻塞的原理，其实就是个递归在那无限等待最小节点释放的过程。

实现锁的可重入，可以带上线程信息就可以了，或者机器信息这样的唯一标识，获取的时候判断一下。

Zookeeper的集群也是高可用的，只要半数以上的或者，就可以对外提供服务了
