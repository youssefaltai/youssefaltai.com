# CI/CD Setup Guide (Future Implementation)

> **Status:** Prepared but not implemented  
> **Cost:** $0 (uses existing VPS)  
> **Time to implement:** ~30 minutes

---

## 🎯 **Chosen Approach: GitLab CI with Self-Hosted Runner**

**Why GitLab:**
- ✅ Free unlimited minutes on self-hosted runners
- ✅ Better Docker integration
- ✅ Simpler configuration (`.gitlab-ci.yml`)
- ✅ All-in-one: Git + CI/CD + Container Registry

**Alternative:** GitHub Actions also works (see `CICD_GITHUB_ALTERNATIVE.md`)

---

## 📋 **Setup Steps (When Ready to Implement)**

### **1. Install GitLab Runner on VPS** (~5 minutes)

```bash
# SSH into VPS
ssh user@your-vps

# Install GitLab Runner
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt-get install gitlab-runner

# Verify
gitlab-runner --version
```

### **2. Register Runner** (~2 minutes)

```bash
# Get registration token from GitLab:
# Project → Settings → CI/CD → Runners → New project runner

sudo gitlab-runner register \
  --url https://gitlab.com/ \
  --registration-token YOUR_TOKEN_HERE \
  --executor shell \
  --description "vps-prod-runner" \
  --tag-list "production,docker" \
  --non-interactive
```

### **3. Configure Runner User** (~3 minutes)

```bash
# Allow gitlab-runner user to use Docker
sudo usermod -aG docker gitlab-runner

# Give access to project directory
sudo chown -R gitlab-runner:gitlab-runner ~/youssefaltai.com

# Restart runner
sudo gitlab-runner restart
```

### **4. Add `.gitlab-ci.yml` to Repo** (~5 minutes)

File already prepared (see below) - just uncomment and commit!

### **5. Test First Deploy** (~15 minutes)

Push a test commit and watch it deploy automatically!

---

## 📄 **Prepared CI/CD Configuration**

The `.gitlab-ci.yml` file is ready to use (currently commented out).
To activate: uncomment, commit, and push!

---

## 🔒 **Security Setup**

### **Environment Variables**

GitLab runner will use VPS environment variables automatically (already configured in `.env`).

No additional secrets needed since runner is on the same machine!

### **Runner Permissions**

- Runner user: `gitlab-runner`
- Needs access to:
  - Docker socket (`/var/run/docker.sock`)
  - Project directory (`~/youssefaltai.com`)
  - PNPM cache

---

## 🧪 **Testing Strategy**

Before activating CI/CD, test the pipeline manually:

```bash
# SSH into VPS
cd ~/youssefaltai.com

# Simulate CI/CD steps
pnpm install --frozen-lockfile
pnpm type-check
pnpm lint
pnpm db:generate
docker compose build
docker compose up -d
pnpm db:push
docker compose ps
```

If all steps succeed, CI/CD will work!

---

## 🎯 **Expected Workflow**

```
Local Machine                    VPS
    |                             |
    | git push origin main        |
    |---->----------------------->|
    |                             |
    |                    GitLab Runner starts
    |                             |
    |                    1. Pull code
    |                    2. Type check
    |                    3. Lint
    |                    4. Build Docker
    |                    5. Deploy
    |                    6. Migrate DB
    |                             |
    |<------- Notification -------|
    |     ✅ Deploy succeeded      |
    |                             |
```

**Total time:** 2-3 minutes from push to live

---

## 💡 **Alternative: Simple Deploy Script** (Active Now)

Until CI/CD is set up, use this one-liner on VPS:

```bash
# ~/youssefaltai.com/deploy.sh
#!/bin/bash
cd ~/youssefaltai.com && \
git pull origin main && \
docker compose up -d --build && \
sleep 10 && \
pnpm db:push && \
docker compose ps && \
echo "✅ Deployed!"
```

**Usage:**
```bash
ssh vps "cd ~/youssefaltai.com && ./deploy.sh"
```

---

## 📊 **Benefits of CI/CD (When You Activate It)**

1. **Speed:** Push and forget (2-3 min automatic deploy)
2. **Safety:** Type checking + linting before deploy
3. **Consistency:** Same steps every time
4. **Visibility:** See deploy history and logs in GitLab
5. **Rollback:** Easy to revert to previous commit

---

## 🚨 **Potential Issues & Solutions**

### **Issue 1: Runner uses VPS resources during builds**
**Solution:** Builds run for 2-3 minutes, then stop. Minimal impact.

### **Issue 2: Failed deploy breaks production**
**Solution:** Add health checks in pipeline, rollback on failure:
```yaml
after_script:
  - |
    if [ $CI_JOB_STATUS == 'failed' ]; then
      echo "Deploy failed, rolling back..."
      docker compose down
      git checkout HEAD~1
      docker compose up -d
    fi
```

### **Issue 3: Database migration fails**
**Solution:** Pipeline stops, containers stay on old version. Manual fix needed.

---

## 📅 **When to Activate**

Activate CI/CD when any of these become true:
- [ ] You deploy more than 3 times per day
- [ ] You have a second contributor
- [ ] Manual deploys feel tedious
- [ ] You want automated testing before deploy
- [ ] You want deploy history tracking

---

**For now:** Use manual deploy (30 seconds) or the deploy script above.  
**Future:** All prep work is done, just follow Step 1-4 when ready! 🚀
