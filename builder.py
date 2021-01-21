#coding=utf-8

import shutil,os,sys,zipfile


if not len(sys.argv)==2:
    print("\nchrome or firefox is must:\n   builder.py chrome \n   builder.py firefox    \n")
    exit()

def readFile(path):
    with open(path,encoding="utf-8") as file:
        return file.read()

def writeToFile(path, data):
    with open(path, "w",encoding="utf-8") as file:
        file.write(data)

def zip_ya(start_dir,extendName):
        start_dir = start_dir  
        file_news = start_dir + "."+extendName+'.zip'  

        z = zipfile.ZipFile(file_news, 'w', zipfile.ZIP_DEFLATED)
        for dir_path, dir_names, file_names in os.walk(start_dir):
            f_path = dir_path.replace(start_dir, '')  
            f_path = f_path and f_path + os.sep or ''  
            for filename in file_names:
                z.write(os.path.join(dir_path, filename), f_path + filename)
        z.close()
        return file_news

manifest=None

if sys.argv[1]=="chrome":
    manifest="manifest.json.chrome"
    shutil.copyfile("image\image_for_chrome\logo-128.png","image\logo-128.png")

elif sys.argv[1]=="firefox":
    manifest="manifest.json.firefox"
    shutil.copyfile("image\image_for_firefox\logo-128.png","image\logo-128.png")

else:
    print("\nparam: chrome or firefox is must:\n    builder.py chrome \n    builder.py firefox\n")
    exit()

manifest=readFile(manifest)

writeToFile("manifest.json",manifest)

zip_ya(os.getcwd(),sys.argv[1])

print("ZIP File: "+os.getcwd() + "."+sys.argv[1]+'.zip')
print("completed")

 