import 'package:flutter/material';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(
    const ProviderScope(
      child: StudentOSApp(),
    ),
  );
}

class StudentOSApp extends StatelessWidget {
  const StudentOSApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'StudentOS AI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.dark,
          background: const Color(0xFF0F172A),
          surface: const Color(0xFF1E293B),
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      ),
      home: const MainNavigationScreen(),
    );
  }
}

// ----------------------------------------------------
// STATE PROVIDERS (Riverpod)
// ----------------------------------------------------

final activeIndexProvider = StateProvider<int>((ref) => 0);

class StudentTask {
  final String id;
  final String title;
  final String category;
  final String priority;
  final String deadline;
  final bool isDone;

  StudentTask({
    required this.id,
    required this.title,
    required this.category,
    required this.priority,
    required this.deadline,
    this.isDone = false,
  });

  StudentTask copyWith({bool? isDone}) {
    return StudentTask(
      id: id,
      title: title,
      category: category,
      priority: priority,
      deadline: deadline,
      isDone: isDone ?? this.isDone,
    );
  }
}

class TaskNotifier extends StateNotifier<List<StudentTask>> {
  TaskNotifier() : super([
    StudentTask(id: '1', title: 'Outline ML Research Draft', category: 'Academics', priority: 'High', deadline: '2026-06-14'),
    StudentTask(id: '2', title: 'Apply Google AI Residency', category: 'Career', priority: 'High', deadline: '2026-06-25'),
    StudentTask(id: '3', title: 'Complete StudentOS Navigation Refactor', category: 'Projects', priority: 'Medium', deadline: '2026-06-12'),
  ]);

  void toggleTask(String id) {
    state = [
      for (final t in state)
        if (t.id == id) t.copyWith(isDone: !t.isDone) else t,
    ];
  }

  void addTask(String title, String category, String priority, String deadline) {
    state = [
      ...state,
      StudentTask(
        id: DateTime.now().toString(),
        title: title,
        category: category,
        priority: priority,
        deadline: deadline,
      )
    ];
  }
}

final taskProvider = StateNotifierProvider<TaskNotifier, List<StudentTask>>((ref) => TaskNotifier());

// ----------------------------------------------------
// FRONTEND NAVIGATION & LAYOUTS
// ----------------------------------------------------

class MainNavigationScreen extends ConsumerWidget {
  const MainNavigationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeIndex = ref.watch(activeIndexProvider);

    final screens = [
      const DashboardScreen(),
      const TaskScreen(),
      const CareerTwinScreen(),
      const AIKeynoterScreen(),
    ];

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F172A), Color(0xFF1E1E38)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: screens[activeIndex],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: Colors.white10, width: 0.5),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: activeIndex,
          onTap: (index) => ref.read(activeIndexProvider.notifier).state = index,
          backgroundColor: const Color(0xFF0F172A),
          selectedItemColor: const Color(0xFF818CF8),
          unselectedItemColor: Colors.slate.shade400,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'Dashboard'),
            BottomNavigationBarItem(icon: Icon(Icons.checklist_rounded), label: 'Tasks'),
            BottomNavigationBarItem(icon: Icon(Icons.psychology_rounded), label: 'Career Twin'),
            BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_rounded), label: 'AI Pilot'),
          ],
        ),
      ),
    );
  }
}

// ----------------------------------------------------
// GLASSMORPHIC CARD CONTAINER
// ----------------------------------------------------

class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;

  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16.0),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1), width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            spreadRadius: 2,
          ),
        ],
      ),
      child: child,
    );
  }
}

// ----------------------------------------------------
// DASHBOARD VIEWS
// ----------------------------------------------------

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome back,',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: Colors.slate.shade400,
                    ),
                  ),
                  Text(
                    'Alex Mercer 👋',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const CircleAvatar(
                radius: 24,
                backgroundColor: Color(0xFF6366F1),
                child: Text('AM', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const GlassCard(
            child: Row(
              children: [
                Icon(Icons.lightbulb_rounded, color: Colors.amber, size: 32),
                SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AI Success Suggestion',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      SizedBox(height: 4),
                      Text(
                        "Your profile readiness is 88%. Adding 'Docker' or container architectures would close your nearest skill gap.",
                        style: TextStyle(fontSize: 13, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Academic Performance Metrics',
            style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.4,
            children: [
              _buildMetricCard('Machine Learning', '95%', Icons.analytics_rounded, Colors.emerald),
              _buildMetricCard('CS attendance', '94%', Icons.check_circle, Colors.indigo),
              _buildMetricCard('Hackathons Won', '2 Wins', Icons.workspace_premium, Colors.amber),
              _buildMetricCard('Study Hours', '38 Hrs', Icons.hourglass_bottom, Colors.pink),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String title, String val, IconData icon, Color col) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: col, size: 24),
              const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Colors.slate),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(val, style: GoogleFonts.spaceGrotesk(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(title, style: const TextStyle(fontSize: 11, color: Colors.white60)),
            ],
          ),
        ],
      ),
    );
  }
}

// ----------------------------------------------------
// TASK VIEWS & KANBAN
// ----------------------------------------------------

class TaskScreen extends ConsumerWidget {
  const TaskScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasks = ref.watch(taskProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Text('Task Central OS', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_task),
            onPressed: () {
              ref.read(taskProvider.notifier).addTask(
                'Submit Firebase Firestore Rules', 'Security', 'High', '2026-06-15'
              );
            },
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
        itemCount: tasks.length,
        itemBuilder: (context, index) {
          final t = tasks[index];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            child: GlassCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(
                  t.title,
                  style: TextStyle(
                    decoration: t.isDone ? TextDecoration.lineThrough : null,
                    color: t.isDone ? Colors.slate : Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                subtitle: Text('Due: ${t.deadline} | Category: ${t.category}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                trailing: Checkbox(
                  value: t.isDone,
                  onChanged: (val) {
                    ref.read(taskProvider.notifier).toggleTask(t.id);
                  },
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

// ----------------------------------------------------
// CAREER TWIN SCREEN
// ----------------------------------------------------

class CareerTwinScreen extends StatelessWidget {
  const CareerTwinScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Career Digital Twin',
            style: GoogleFonts.spaceGrotesk(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            'A digital avatar modeling your current skills, records & readiness.',
            style: TextStyle(color: Colors.slate.shade400, fontSize: 13),
          ),
          const SizedBox(height: 20),
          const GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Placement Readiness Predictor',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Placement score matches:', style: TextStyle(color: Colors.white70)),
                    Text('88 / 100', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF818CF8))),
                  ],
                ),
                SizedBox(height: 8),
                LinearProgressIndicator(value: 0.88, color: Color(0xFF818CF8), backgroundColor: Colors.white10),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text('Identified Skill Gaps', style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildTag('Docker'),
              const SizedBox(width: 8),
              _buildTag('Kubernetes'),
              const SizedBox(width: 8),
              _buildTag('Advanced SQL'),
            ],
          ),
          const SizedBox(height: 24),
          const GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Career Roadmap Milestone', style: TextStyle(fontWeight: FontWeight.bold)),
                SizedBox(height: 8),
                Text('Phase 1: Deep Tech Foundations', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.indigoAccent)),
                SizedBox(height: 4),
                Text('Deploy fully persistent Flask servers with robust Docker indexing pipelines.', style: TextStyle(fontSize: 12, color: Colors.white70)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTag(String l) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.redAccent.withOpacity(0.1),
        border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(l, style: const TextStyle(color: Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold)),
    );
  }
}

// ----------------------------------------------------
// AI CHATBOT / CO-PILOT
// ----------------------------------------------------

class AIKeynoterScreen extends StatefulWidget {
  const AIKeynoterScreen({super.key});

  @override
  State<AIKeynoterScreen> createState() => _AIKeynoterScreenState();
}

class _AIKeynoterScreenState extends State<AIKeynoterScreen> {
  final List<Map<String, String>> _msgs = [
    {'sender': 'ai', 'text': 'Hello! I am your AI Memory Partner. Ask me: "Show all my healthcare work" or "Do I have any pending marks?"'}
  ];
  final TextEditingController _ctr = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AppBar(
          title: Text('StudentOS Assistant', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)),
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16.0),
            itemCount: _msgs.length,
            itemBuilder: (context, idx) {
              final m = _msgs[idx];
              final isAi = m['sender'] == 'ai';
              return Align(
                alignment: isAi ? Alignment.centerLeft : Alignment.centerRight,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isAi ? Colors.white.withOpacity(0.04) : const Color(0xFF6366F1).withOpacity(0.6),
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: isAi ? Radius.zero : const Radius.circular(16),
                      bottomRight: isAi ? const Radius.circular(16) : Radius.zero,
                    ),
                    border: Border.all(color: isAi ? Colors.white12 : Colors.transparent),
                  ),
                  child: Text(
                    m['text']!,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                  ),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Expanded(
                child: GlassCard(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                  child: TextField(
                    controller: _ctr,
                    decoration: const InputDecoration(
                      hintText: 'Ask StudentOS AI...',
                      border: InputBorder.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              CircleAvatar(
                radius: 24,
                backgroundColor: const Color(0xFF6366F1),
                child: IconButton(
                  icon: const Icon(Icons.send, color: Colors.white),
                  onPressed: () {
                    if (_ctr.text.trim().isEmpty) return;
                    setState(() {
                      _msgs.add({'sender': 'user', 'text': _ctr.text});
                      final userMsg = _ctr.text.toLowerCase();
                      _ctr.clear();
                      
                      // Immediate intelligent semantic responses matcher
                      if (userMsg.contains("health") || userMsg.contains("clinical")) {
                        _msgs.add({'sender': 'ai', 'text': "Found **1 major project**: 'MedAI Diagnostix Engine' built with TensorFlow. Goal is Edge-diagnostics scans."});
                      } else {
                        _msgs.add({'sender': 'ai', 'text': "I've cataloged your records. Alex, your cumulative GPA is **3.92** and we identified 3 tasks to complete by Tuesday."});
                      }
                    });
                  },
                ),
              )
            ],
          ),
        ),
      ],
    );
  }
}
